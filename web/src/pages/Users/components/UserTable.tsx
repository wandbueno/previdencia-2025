import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate, formatCPF } from '@/utils/format';
import { User, UserTableType } from '@/types/user';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getUser } from '@/utils/auth';
import { api } from '@/lib/axios';

interface UserWithProofStatus extends User {
  proofOfLifeStatus?: string | null;
}

interface UserTableProps {
  users: UserWithProofStatus[];
  isLoading: boolean;
  onView: (user: UserWithProofStatus) => void;
  type: UserTableType;
}

export function UserTable({ users, isLoading, onView, type }: UserTableProps) {
  // Função para formatar o status da prova de vida
  const formatProofOfLifeStatus = (status: string | null | undefined): string => {
    if (!status) return 'Não Enviada';
    
    const statusLabels: Record<string, string> = {
      PENDING: 'Pendente',
      SUBMITTED: 'Em análise',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada'
    };
    
    return statusLabels[status] || 'Não Enviada';
  };

  // Colunas para usuários administradores
  const adminColumns: ColumnDef<UserWithProofStatus>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email}</span>
      )
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">{formatCPF(row.original.cpf)}</span>
      )
    },
    {
      accessorKey: 'active',
      header: 'Status',
      size: 100,
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'success' : 'error'}>
          {row.original.active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Ação',
      size: 80,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  // Colunas para usuários do app
  const appColumns: ColumnDef<UserWithProofStatus>[] = [
    {
      id: 'index',
      header: '#',
      size: 60,
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.index + 1}</span>
      )
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">{formatCPF(row.original.cpf)}</span>
      )
    },
    {
      accessorKey: 'benefitType',
      header: 'Benefício',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
        </span>
      )
    },
    {
      accessorKey: 'benefitStartDate',
      header: 'Data Início',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.benefitStartDate)}
        </span>
      )
    },
    {
      accessorKey: 'benefitEndDate',
      header: 'Data Fim',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.benefitEndDate || '-'}
        </span>
      )
    },
    {
      accessorKey: 'proofOfLifeStatus',
      header: 'Prova de Vida',
      size: 130,
      cell: ({ row }) => {
        const status = row.original.proofOfLifeStatus;
        
        if (!status) {
          return <Badge variant="warning">Não Enviada</Badge>;
        }
        
        const statusColors = {
          PENDING: 'warning',
          SUBMITTED: 'info', // Alterado de 'warning' para 'info' (azul)
          APPROVED: 'success',
          REJECTED: 'error',
        } as const;
        
        return (
          <Badge variant={statusColors[status as keyof typeof statusColors]}>
            {formatProofOfLifeStatus(status)}
          </Badge>
        );
      }
    },
    {
      accessorKey: 'active',
      header: 'Status',
      size: 100,
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'success' : 'error'}>
          {row.original.active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Ação',
      size: 80,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  const handleExportPDF = async () => {
    const currentUser = getUser();
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Configuração de dimensões da página
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    let currentY = margin;

    try {
      // Adicionar logo e informações do órgão
      const organization = currentUser?.organization;
      
      if (organization?.name) {
        // Buscar detalhes públicos da organização para obter a logo
        try {
          const { data: organizations } = await api.get('/organizations/public');
          const fullOrganization = organizations.find((org: any) => org.id === organization.id);
          
          // Usar a logo da organização completa ou a do currentUser se disponível
          if (fullOrganization) {
            // Tratar o caminho da logo
            let logoPath = fullOrganization.logo_url;
            if (logoPath && logoPath.startsWith('/logos/')) {
              logoPath = logoPath.replace('/logos/', '/uploads/logos/');
            }
            
            if (logoPath) {
              try {
                // Converter logo para formato compatível com jsPDF
                const logoImg = await convertImageToDataURL(logoPath);
                
                // Calcular dimensões mantendo proporção
                const maxLogoHeight = 15; // altura máxima em mm
                const logoWidth = (logoImg.width / logoImg.height) * maxLogoHeight;
                
                // Centralizar logo
                const logoX = (pageWidth - logoWidth) / 2;
                
                // Adicionar logo
                doc.addImage(logoImg.dataUrl, 'PNG', logoX, currentY, logoWidth, maxLogoHeight);
                currentY += maxLogoHeight + 5;
              } catch (error) {
                console.error('Erro ao processar imagem:', error);
                // Continuar sem a logo
              }
            }
          }
        } catch (error) {
          console.error('Erro ao obter detalhes da organização:', error);
          // Continuar sem a logo
        }
        
        // Adicionar nome do órgão
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        const orgNameText = organization.name;
        const orgNameWidth = doc.getTextWidth(orgNameText);
        const orgNameX = (pageWidth - orgNameWidth) / 2;
        doc.text(orgNameText, orgNameX, currentY);
        currentY += 6;
        
        // Adicionar localização do órgão se disponível
        if (organization.city && organization.state) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          const locationText = `${organization.city} - ${organization.state}`;
          const locationWidth = doc.getTextWidth(locationText);
          const locationX = (pageWidth - locationWidth) / 2;
          doc.text(locationText, locationX, currentY);
          currentY += 6;
        }
      }
      
      // Adicionar título do relatório
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      const title = `Lista de ${type === 'admin' ? 'Administradores' : 'Usuários'}`;
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, currentY);
      currentY += 6;
      
      // Adicionar data da geração
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const dateText = `Documento Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`;
      const dateWidth = doc.getTextWidth(dateText);
      const dateX = (pageWidth - dateWidth) / 2;
      doc.text(dateText, dateX, currentY);
      currentY += 8;
    } catch (error) {
      console.error('Erro ao preparar cabeçalho do PDF:', error);
      // Ajustar posição Y para garantir espaço para a tabela
      currentY = 30;
    }

    // Prepare data for table
    const data = users.map((user, index) => {
      if (type === 'admin') {
        return [
          (index + 1).toString(), // Numeração
          user.name,
          user.email,
          formatCPF(user.cpf),
          user.active ? 'Ativo' : 'Inativo'
        ];
      }
      return [
        (index + 1).toString(), // Numeração
        user.name,
        formatCPF(user.cpf),
        user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
        formatDate(user.benefitStartDate),
        user.benefitEndDate || '-',
        formatProofOfLifeStatus(user.proofOfLifeStatus),
        user.active ? 'Ativo' : 'Inativo'
      ];
    });

    // Calcular a largura disponível
    const availableWidth = pageWidth - (2 * margin);
    
    // Definir larguras relativas para cada coluna (somar deve dar 100%)
    const columnWidthPercentages = type === 'admin' 
      ? [5, 30, 35, 15, 15]  // #, Nome, Email, CPF, Status
      : [5, 23, 10, 12, 12, 12, 14, 12];  // #, Nome, CPF, Benefício, Data Início, Data Fim, Prova de Vida, Status
    
    // Calcular larguras absolutas em mm
    const columnWidths = columnWidthPercentages.map(
      percentage => (percentage / 100) * availableWidth
    );

    // Add table
    (doc as any).autoTable({
      startY: currentY,
      head: [type === 'admin' 
        ? ['#', 'Nome', 'Email', 'CPF', 'Status']
        : ['#', 'Nome', 'CPF', 'Benefício', 'Data Início', 'Data Fim', 'Prova de Vida', 'Status']
      ],
      body: data,
      theme: 'striped',
      headStyles: { 
        fillColor: [2, 132, 199],
        fontSize: 9,
        halign: 'center',
        valign: 'middle'
      },
      styles: { 
        fontSize: 8,
        cellPadding: 2
      },
      // Definir larguras de colunas usando valores absolutos
      columnStyles: type === 'admin' 
        ? {
            0: { cellWidth: columnWidths[0], halign: 'center' }, // #
            1: { cellWidth: columnWidths[1], halign: 'left' },   // Nome
            2: { cellWidth: columnWidths[2], halign: 'left' },   // Email
            3: { cellWidth: columnWidths[3], halign: 'center' }, // CPF
            4: { cellWidth: columnWidths[4], halign: 'center' }  // Status
          }
        : {
            0: { cellWidth: columnWidths[0], halign: 'center' }, // #
            1: { cellWidth: columnWidths[1], halign: 'left' },   // Nome
            2: { cellWidth: columnWidths[2], halign: 'center' }, // CPF
            3: { cellWidth: columnWidths[3], halign: 'center' }, // Benefício
            4: { cellWidth: columnWidths[4], halign: 'center' }, // Data Início
            5: { cellWidth: columnWidths[5], halign: 'center' }, // Data Fim
            6: { cellWidth: columnWidths[6], halign: 'center' }, // Prova de Vida
            7: { cellWidth: columnWidths[7], halign: 'center' }  // Status
          },
      margin: { left: margin, right: margin }
    });

    // Adicionar rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      const footerText = `Página ${i} de ${pageCount}`;
      doc.setFontSize(8);
      doc.text(
        footerText,
        pageWidth - margin - doc.getTextWidth(footerText),
        pageHeight - 10
      );
    }

    // Gerar o PDF e abrir em nova aba em vez de baixar
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');

    // Limpar a URL do objeto após um tempo
    setTimeout(() => {
      URL.revokeObjectURL(pdfUrl);
    }, 100);
  };

  // Função auxiliar para converter imagem para DataURL
  const convertImageToDataURL = async (imageUrl: string): Promise<{ dataUrl: string; width: number; height: number }> => {
    try {
      // Tratar URLs com referências relativas (ex: ../../data/uploads/)
      let fixedUrl = imageUrl;
      
      // 1. Detectar padrões "../" nos caminhos
      if (imageUrl.includes('../')) {
        // 2. Extrair a parte relevante do caminho após "data/uploads/"
        const match = imageUrl.match(/data\/uploads\/(.*)/);
        if (match && match[1]) {
          // Pegar apenas a parte após data/uploads/
          const relevantPath = match[1];
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          fixedUrl = `${baseUrl}/uploads/${relevantPath}`;
        }
      } 
      // 3. Tratamento alternativo usando UUIDs
      else if (imageUrl.includes('/')) {
        // 4. Remover prefixos redundantes
        let relevantPath = imageUrl;
        
        if (relevantPath.startsWith('/uploads/')) {
          relevantPath = relevantPath.substring('/uploads/'.length);
        } else if (relevantPath.startsWith('data/uploads/')) {
          relevantPath = relevantPath.substring('data/uploads/'.length);
        } else if (relevantPath.startsWith('/data/uploads/')) {
          relevantPath = relevantPath.substring('/data/uploads/'.length);
        }
        
        // 5. Gerar URL correta se não for uma URL completa
        if (!relevantPath.startsWith('http')) {
          const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          fixedUrl = `${baseUrl}/uploads/${relevantPath}`;
        }
      }
      
      // Fazer a requisição com a URL corrigida
      const response = await fetch(fixedUrl);
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
            const dataUrl = canvas.toDataURL('image/png');
            resolve({
              dataUrl,
              width: img.width,
              height: img.height
            });
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => {
          console.error('Erro ao carregar imagem:', fixedUrl);
          reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem:', error);
      throw error;
    }
  };

  const handleExportXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuários');

    // Define columns
    const columns = type === 'admin' 
      ? [
          { header: 'Nome', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Status', key: 'status' }
        ]
      : [
          { header: 'Nome', key: 'name' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Benefício', key: 'benefitType' },
          { header: 'Data Início', key: 'benefitStartDate' },
          { header: 'Data Fim', key: 'benefitEndDate' },
          { header: 'Prova de Vida', key: 'proofOfLifeStatus' },
          { header: 'Status', key: 'status' }
        ];

    worksheet.columns = columns;

    // Add rows
    const rows = users.map(user => {
      if (type === 'admin') {
        return {
          name: user.name,
          email: user.email || '-',
          cpf: formatCPF(user.cpf),
          status: user.active ? 'Ativo' : 'Inativo'
        };
      }
      return {
        name: user.name,
        cpf: formatCPF(user.cpf),
        benefitType: user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
        benefitStartDate: formatDate(user.benefitStartDate),
        // Changed this line to use the raw benefitEndDate value
        benefitEndDate: user.benefitEndDate || '-',
        proofOfLifeStatus: formatProofOfLifeStatus(user.proofOfLifeStatus),
        status: user.active ? 'Ativo' : 'Inativo'
      };
    });

    worksheet.addRows(rows);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0284C7' } // primary-600 color
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Save file using file-saver
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `usuarios-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = type === 'admin' 
      ? ['Nome', 'Email', 'CPF', 'Status']
      : ['Nome', 'CPF', 'Benefício', 'Data Início', 'Data Fim', 'Prova de Vida', 'Status'];

    const csvContent = [
      headers.join(','),
      ...users.map(user => {
        if (type === 'admin') {
          return [
            user.name,
            user.email,
            formatCPF(user.cpf),
            user.active ? 'Ativo' : 'Inativo'
          ].join(',');
        }
        return [
          user.name,
          formatCPF(user.cpf),
          user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
          formatDate(user.benefitStartDate),
          // Changed this line to use the raw benefitEndDate value
          user.benefitEndDate || '-',
          formatProofOfLifeStatus(user.proofOfLifeStatus),
          user.active ? 'Ativo' : 'Inativo'
        ].join(',');
      })
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns = type === 'admin' ? adminColumns : appColumns;

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportXLSX}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          XLSX
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
      />
    </div>
  );
}