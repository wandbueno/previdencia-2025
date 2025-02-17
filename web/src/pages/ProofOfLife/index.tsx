// web/src/pages/ProofOfLife/index.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getUser } from '@/utils/auth';
import { ReviewProofOfLifeModal } from './components/ReviewProofOfLifeModal';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type ColumnDef } from '@tanstack/react-table';
import { formatDate, formatCPF, formatCNPJ, formatPhone } from '@/utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProofOfLife {
  id: string;
  user: {
    id: string;
    name: string;
    cpf: string;
    rg: string;
    email?: string;
    birthDate?: string;
    phone?: string;
    address?: string;
    processNumber?: string;
    benefitStartDate?: string;
    benefitEndDate?: string;
    benefitType?: string;
    registrationNumber?: string;
  };
  event: {
    id: string;
    title: string;
  };
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  selfieUrl: string;
  documentFrontUrl: string;
  documentBackUrl: string;
  comments?: string;
  createdAt: string;
  reviewedAt?: string;
}

export function ProofOfLifePage() {
  const [selectedProof, setSelectedProof] = useState<ProofOfLife | null>(null);
  const user = getUser();

  // Corrigido a desestruturação do useQuery para incluir isPending
  const { data: proofs, isPending } = useQuery<ProofOfLife[]>({
    queryKey: ['proof-of-life'],
    queryFn: async () => {
      const response = await api.get('/proof-of-life/admin?include=user&fields=user.email,user.birthDate,user.phone,user.address,user.processNumber,user.registrationNumber,user.benefitStartDate,user.benefitEndDate,user.benefitType');
      console.log('API Response:', response.data);
      return response.data;
    },
  });

  const statusColors = {
    PENDING: 'warning',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  } as const;

  const statusLabels = {
    PENDING: 'Pendente',
    SUBMITTED: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
  };

  const columns: ColumnDef<ProofOfLife>[] = [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => row.index + 1,
      size: 50 // Largura fixa para número da linha
    },
    {
      accessorFn: (row) => row.user.name,
      header: 'Nome',
      size: 200 // Largura fixa para o nome
    },
    {
      accessorFn: (row) => row.user.cpf,
      header: 'CPF',
      cell: ({ row }) => formatCPF(row.original.user.cpf),
      size: 120 // Largura fixa para CPF
    },
    {
      accessorFn: (row) => row.user.rg,
      header: 'RG',
      size: 100 // Largura fixa para RG
    },
    {
      accessorFn: (row) => row.event.title,
      header: 'Evento',
      size: 150 // Largura fixa para evento
    },
    {
      accessorKey: 'createdAt',
      header: 'Data/Hora do Envio',
      cell: ({ getValue }) => formatDate(getValue<string>(), true),
      size: 160 // Largura fixa para data/hora
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<ProofOfLife['status']>();
        return (
          <Badge variant={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        );
      },
      size: 100 // Largura fixa para status
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 h-8 w-8 p-0"
            onClick={() => {
              console.log('Selected proof:', row.original);
              setSelectedProof(row.original);
            }}
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
      size: 70 // Largura fixa para ações
    }
  ];

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    if (!proofs) return;
    const exportData = proofs.map((proof, index) => ({
      '#': index + 1,
      Nome: proof.user.name,
      CPF: formatCPF(proof.user.cpf),
      RG: proof.user.rg,
      'Telefone': proof.user.phone,
      'Início Benefício': proof.user.benefitStartDate && !isNaN(new Date(proof.user.benefitStartDate).getTime()) 
        ? format(new Date(proof.user.benefitStartDate), 'dd/MM/yyyy', { locale: ptBR }) 
        : '-',
      'Fim Benefício': proof.user.benefitEndDate,
      Evento: proof.event.title,
      'Data/Hora do Envio': formatDate(proof.createdAt, true),
      Status: statusLabels[proof.status],
      'Data da Revisão': proof.reviewedAt ? formatDate(proof.reviewedAt, true) : '-',
      Observações: proof.comments || '-'
    }));

    if (type === 'csv' || type === 'excel') {
      const { Workbook } = await import('exceljs');
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Provas de Vida Realizadas');

      // Add headers
      const headers = Object.keys(exportData[0]);
      worksheet.addRow(headers);

      // Add data
      exportData.forEach(row => {
        worksheet.addRow(Object.values(row));
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: type === 'csv' 
          ? 'text/csv;charset=utf-8'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const { saveAs } = await import('file-saver');
      saveAs(blob, `provas-de-vida.${type}`);
    } else if (type === 'pdf') {
      try {
        const { default: jsPDF } = await import('jspdf');
        await import('jspdf-autotable'); 

        // Obter informações da organização do usuário logado
        const currentUser = getUser();
        if (!currentUser?.organization) {
          throw new Error('Informações da organização não encontradas');
        }

        // Buscar detalhes públicos da organização
        const { data: organizations } = await api.get('/organizations/public');
        const organization = organizations.find((org: any) => org.id === currentUser.organization?.id);
        
        if (!organization) {
          throw new Error('Detalhes da organização não encontrados');
        } else {
          const logoPath = `/logos/2bde824830571307dbf990fbacac5378-arraiasprev.webp`;
          organization.logo = logoPath.replace('/logos/', '/uploads/logos/');
        }

        // Criar o documento PDF
        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        // Configurações da página
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        
        // Função para converter WEBP para PNG e retornar dimensões
        const convertWebPToPNG = async (webpUrl: string): Promise<{ dataUrl: string; width: number; height: number }> => {
          const response = await fetch(webpUrl);
          const blob = await response.blob();
          
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
              }
              
              // Definir fundo transparente
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(img, 0, 0);
              
              try {
                const pngData = canvas.toDataURL('image/png');
                resolve({
                  dataUrl: pngData,
                  width: img.width,
                  height: img.height
                });
              } catch (error) {
                reject(error);
              }
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(blob);
          });
        };
        
        // Função para calcular dimensões mantendo proporção
        const calculateDimensions = (originalWidth: number, originalHeight: number, maxSize: number) => {
          const aspectRatio = originalWidth / originalHeight;
          
          if (originalWidth > originalHeight) {
            // Imagem mais larga que alta
            return {
              width: maxSize,
              height: maxSize / aspectRatio
            };
          } else {
            // Imagem mais alta que larga ou quadrada
            return {
              width: maxSize * aspectRatio,
              height: maxSize
            };
          }
        };
        
        // Função para adicionar cabeçalho
        const addHeader = async (doc: any) => {
          try {
            let currentY = 10; // Posição Y inicial
            
            // Se tiver logo, adiciona
            if (organization?.logo) {
              try {
                const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
                const logoUrl = `${baseUrl}${organization.logo}`;
                
                const { dataUrl: pngData, width: originalWidth, height: originalHeight } = await convertWebPToPNG(logoUrl);
                
                // Calcular dimensões mantendo proporção
                const maxSize = 25; // tamanho máximo em mm
                const { width: logoWidth, height: logoHeight } = calculateDimensions(originalWidth, originalHeight, maxSize);
                
                // Centralizar logo
                const logoX = (pageWidth - logoWidth) / 2;
                
                // Adiciona logo centralizada
                doc.addImage(pngData, 'PNG', logoX, currentY, logoWidth, logoHeight, undefined, 'FAST');

                // Atualiza posição Y para o nome da organização
                currentY += logoHeight + 6; // 6mm de espaço após a logo

                // Nome da organização centralizado abaixo da logo
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                const orgName = organization.name || currentUser.organization?.name || '';
                const textWidth = doc.getTextWidth(orgName);
                const textX = (pageWidth - textWidth) / 2;
                doc.text(orgName, textX, currentY);
                
                // Atualiza posição Y para o próximo elemento
                currentY += 5; // Reduzido de 8mm para 5mm após o nome da organização
              } catch (error) {
                // Fallback: apenas o nome centralizado
                doc.setFont('helvetica', 'bold');
                doc.setFontSize(12);
                const orgName = organization.name || currentUser.organization?.name || '';
                const textWidth = doc.getTextWidth(orgName);
                const textX = (pageWidth - textWidth) / 2;
                doc.text(orgName, textX, currentY);
                currentY += 5;
              }
            } else {
              // Sem logo: apenas o nome centralizado
              doc.setFont('helvetica', 'bold');
              doc.setFontSize(12);
              const orgName = organization?.name || currentUser.organization?.name || '';
              const textWidth = doc.getTextWidth(orgName);
              const textX = (pageWidth - textWidth) / 2;
              doc.text(orgName, textX, currentY);
              currentY += 5;
            }
            
            // Retorna a posição Y final do cabeçalho
            return currentY;
          } catch (error) {
            doc.text('Lista de Provas de Vida', 10, 18);
            return 25; // Valor padrão em caso de erro
          }
        };

        // Função para adicionar rodapé
        const addFooter = (doc: any) => {
          try {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(8);
            const footerY = pageHeight - 10;
            
            if (organization) {
              // Primeira linha do rodapé
              const addressLine = `${organization.address || ''}, ${organization.city || currentUser.organization?.city || ''}-${organization.state || currentUser.organization?.state || ''}`;
              const cepLine = organization.cep ? `, CEP: ${organization.cep}` : '';
              doc.text(addressLine + cepLine, pageWidth/2, footerY - 6, { align: 'center' });
              
              // Segunda linha do rodapé
              if (organization.phone || organization.email || organization.cnpj) {
                const contactParts = [];
                if (organization.phone) contactParts.push(`Tel: ${formatPhone(organization.phone)}`);
                if (organization.email) contactParts.push(`Email: ${organization.email}`);
                if (organization.cnpj) contactParts.push(`CNPJ: ${formatCNPJ(organization.cnpj)}`);
                
                const contactLine = contactParts.join(' | ');
                doc.text(contactLine, pageWidth/2, footerY - 2, { align: 'center' });
              }
            } else {
              // Fallback para informações básicas
              const addressLine = `${currentUser.organization?.city || ''}-${currentUser.organization?.state || ''}`;
              doc.text(addressLine, pageWidth/2, footerY - 2, { align: 'center' });
            }
          } catch (error) {
            // Silenciosamente falha se houver erro no rodapé
          }
        };
        
        // Adicionar cabeçalho na primeira página e obter posição Y final
        const headerEndY = await addHeader(doc);
      
        // Título centralizado
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const title = 'Provas de vida Realizadas';
        const titleWidth = doc.getTextWidth(title);
        const titleX = (pageWidth - titleWidth) / 2;
        doc.text(title, titleX, headerEndY + 3); // Reduzido de 5mm para 3mm após o cabeçalho
            
        // Data e hora centralizada
        doc.setFontSize(9);
        const currentDateTime = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", {
          locale: ptBR
        });
        const dateText = `Gerado em: ${currentDateTime}`;
        const dateWidth = doc.getTextWidth(dateText);
        const dateX = (pageWidth - dateWidth) / 2;
        doc.text(dateText, dateX, headerEndY + 10); // Reduzido de 12mm para 10mm após o título
        
        // Configurar tabela com margens para cabeçalho e rodapé
        doc.autoTable({
          startY: headerEndY + 15, // Reduzido de 20mm para 15mm após a data
          head: [Object.keys(exportData[0])],
          body: exportData.map(row => Object.values(row)),
          styles: {
            fontSize: 8,
            cellPadding: 2
          },
          margin: { top: headerEndY + 15, bottom: 25 }, // Ajustado aqui também
          didDrawPage: function(data: any) {
            if (data.pageNumber > 1) {
              addHeader(doc);
            }
            addFooter(doc);
          }
        });
        
        // Gerar o PDF e abrir em nova aba
        const pdfBlob = doc.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        window.open(pdfUrl, '_blank');

        // Limpar a URL do objeto após um tempo
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
        }, 100);

      } catch (error) {
        if (error instanceof Error) {
          alert(`Erro ao gerar o PDF: ${error.message}`);
        } else {
          alert('Erro ao gerar o PDF. Por favor, tente novamente.');
        }
      }
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Prova de Vida</h1>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'ADMIN'
              ? 'Lista de todas as provas de vida enviadas.'
              : 'Histórico de provas de vida.'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {isPending ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={proofs || []} 
            onExport={handleExport}
          />
        )}
        </div>

      {selectedProof && (
        <ReviewProofOfLifeModal
          proof={selectedProof}
          open={!!selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
}
