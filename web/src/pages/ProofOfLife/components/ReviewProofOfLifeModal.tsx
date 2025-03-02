import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import clsx from 'clsx';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProofImage } from './ExpandedImage';
import { api } from '@/lib/axios';
import { getUser } from '@/utils/auth';
import DebugImageTool from './DebugImageTool';

const statusLabels = {
  PENDING: 'Pendente',
  SUBMITTED: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado'
} as const;

interface ProofOfLife {
  id: string;
  user: {
    id: string;
    name: string;
    cpf: string;
    rg: string;
    registrationNumber?:string;
    email?: string;
    birthDate?: string;
    phone?: string;
    address?: string;
    processNumber?: string;
    benefitStartDate?: string;
    benefitEndDate?: string;
    benefitType?: string;
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
  reviewedBy?: string;
}

interface ReviewProofOfLifeModalProps {
  proof: ProofOfLife;
  open: boolean;
  onClose: () => void;
}

function formatDate(date: string, includeTime = false) {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    return format(dateObj, 
      includeTime 
        ? "dd/MM/yyyy 'às' HH:mm:ss"
        : 'dd/MM/yyyy',
      { locale: ptBR }
    );
  } catch (error) {
    return '-';
  }
}

const reviewSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  comments: z.string().optional()
});

type ReviewFormData = z.infer<typeof reviewSchema>;

const statusOptions = [
  { value: 'APPROVED', label: 'Aprovar' },
  { value: 'REJECTED', label: 'Rejeitar' }
];

function getImageUrl(path: string | undefined) {
  if (!path) {
    console.log('Caminho vazio, usando placeholder');
    return 'https://previdencia-2025-plw27a.fly.dev/placeholder-image.png';
  }

  console.log('Caminho original recebido:', path);

  // Se já for uma URL completa, retorna ela mesma
  if (path.startsWith('http://') || path.startsWith('https://')) {
    console.log('URL completa detectada:', path);
    return path;
  }

  // Em produção sempre usar o endereço do backend hospedado no Fly.io
  const baseUrl = import.meta.env.PROD 
    ? 'https://previdencia-2025-plw27a.fly.dev'
    : (import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:3000');

  // Removemos qualquer barra extra para evitar problemas de caminho
  // Também removemos qualquer prefixo de pasta (uploads/ ou /uploads/)
  let cleanPath = path;
  
  // Remover o prefixo /uploads/ ou uploads/ se existir
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(9); // Remove '/uploads/'
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.substring(8); // Remove 'uploads/'
  }
  
  // Remover qualquer barra extra no início
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  const finalUrl = `${baseUrl}/uploads/${cleanPath}`;
  console.log('URL final gerada:', finalUrl);
  
  // Verificar se a imagem existe via HEAD request (CORS pré-voo)
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', finalUrl, false); // false para síncrono
    xhr.send();
    if (xhr.status === 200) {
      console.log(`Imagem ${finalUrl} existe no servidor`);
    } else {
      console.error(`Imagem ${finalUrl} não encontrada no servidor (status ${xhr.status})`);
    }
  } catch (error) {
    console.error(`Erro ao verificar imagem ${finalUrl}:`, error);
  }
  
  return finalUrl;
}

function formatPhone(phone: string) {
  return `(${phone.substring(0, 2)}) ${phone.substring(2, 7)}-${phone.substring(7, 11)}`;
}

function formatCNPJ(cnpj: string) {
  return `${cnpj.substring(0, 2)}.${cnpj.substring(2, 5)}.${cnpj.substring(5, 8)}/${cnpj.substring(8, 12)}-${cnpj.substring(12, 14)}`;
}

export function ReviewProofOfLifeModal({ proof, open, onClose }: ReviewProofOfLifeModalProps) {
  const [expandedImageData, setExpandedImageData] = useState<{ url: string; label: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  // Carregar o histórico quando o modal abrir
  useEffect(() => {
    if (open && proof.id) {
      console.log('Dados recebidos do backend:', proof);
      console.log('Caminhos de imagem recebidos:', proof.selfieUrl, proof.documentFrontUrl, proof.documentBackUrl);
      api.get(`/proof-of-life/history/${proof.id}`)
        .then(response => {
          console.log('Dados do histórico:', response.data);
          setHistory(response.data);
        })
        .catch(error => {
          console.error('Erro ao carregar histórico:', error);
        });
    }
  }, [open, proof.id]);

  // Não precisamos mais fazer a requisição adicional, pois os dados já vêm completos
  const user = proof.user;

  console.log('Modal proof data:', proof);
  console.log('Modal user data:', user);

  const {
    handleSubmit,
    register,
    control,
    watch,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema)
  });

  const selectedStatus = watch('status');

  const handleExportPDF = async (): Promise<void> => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let currentY = margin;

    // Buscar informações da organização
    let organization;
    try {
      // Obter informações da organização do usuário logado
      const currentUser = getUser();
      if (!currentUser?.organization) {
        throw new Error('Informações da organização não encontradas');
      }

      // Buscar detalhes públicos da organização
      const { data: organizations } = await api.get('/organizations/public');
      organization = organizations.find((org: any) => org.id === currentUser.organization?.id);

      if (!organization) {
        throw new Error('Detalhes da organização não encontrados');
      } else {
        // Ajustar o caminho do logo para incluir /uploads/ se necessário
        let logoPath = organization.logo_url;
        if (logoPath.startsWith('/logos/')) {
          logoPath = logoPath.replace('/logos/', '/uploads/logos/');
        }
        organization.logo = logoPath;
      }

      // Logo
      if (organization.logo) {
        try {
          // Determinar a base URL para os arquivos estáticos
          let baseUrl;
          
          // Em produção sempre usar o endereço do backend hospedado no Fly.io
          if (import.meta.env.PROD) {
            baseUrl = 'https://previdencia-2025-plw27a.fly.dev';
          }
          // Primeiro tenta usar a variável de ambiente
          else if (import.meta.env.VITE_API_URL) {
            // Remove o '/api' do final para obter a origem do servidor
            baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
          } 
          // Tenta obter da configuração atual do axios
          else if (api.defaults.baseURL) {
            // Remove o '/api' do final
            baseUrl = api.defaults.baseURL.replace('/api', '');
          }
          // Fallback para desenvolvimento local
          else {
            baseUrl = 'http://localhost:3000';
          }
          
          // Ajustar o caminho do logo para incluir /uploads/ se necessário
          let logoPath = organization.logo_url;
          if (logoPath.startsWith('/logos/')) {
            logoPath = logoPath.replace('/logos/', '/uploads/logos/');
          }
          
          // Construir URL completa
          const logoUrl = logoPath.startsWith('http') 
            ? logoPath 
            : `${baseUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
          
          console.log('Logo URL completa:', logoUrl);

          // Função para converter WEBP para PNG
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
          
          const { dataUrl: pngData, width: originalWidth, height: originalHeight } = await convertWebPToPNG(logoUrl);
          
          const maxSize = 25;
          const aspectRatio = originalWidth / originalHeight;
          
          let imgWidth, imgHeight;
          if (originalWidth > originalHeight) {
            // Imagem mais larga que alta
            imgWidth = maxSize;
            imgHeight = maxSize / aspectRatio;
          } else {
            // Imagem mais alta que larga ou quadrada
            imgWidth = maxSize * aspectRatio;
            imgHeight = maxSize;
          }
          
          const imgX = (pageWidth - imgWidth) / 2;
          doc.addImage(pngData, 'PNG', imgX, currentY, imgWidth, imgHeight, undefined, 'FAST');
          currentY += imgHeight + 6;

          // Nome da organização centralizado abaixo da logo
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const orgName = organization.name || currentUser.organization?.name || '';
          const textWidth = doc.getTextWidth(orgName);
          const textX = (pageWidth - textWidth) / 2;
          doc.text(orgName, textX, currentY);
          currentY += 10;
        } catch (error) {
          console.error('Erro ao adicionar logo:', error);
          // Fallback: apenas o nome centralizado
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const orgName = organization.name || currentUser.organization?.name || '';
          const textWidth = doc.getTextWidth(orgName);
          const textX = (pageWidth - textWidth) / 2;
          doc.text(orgName, textX, currentY);
          currentY += 10;
        }
      }
    } catch (error) {
      console.error('Erro ao carregar informações da organização:', error);
    }

    // Título
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const title = `DETALHES DA PROVA DE VIDA DE ${user.name.toUpperCase()}`;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, currentY);
    currentY += 10;

    // Data e hora
    doc.setFontSize(9);
    const currentDateTime = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", {
      locale: ptBR
    });
    const dateWidth = doc.getTextWidth(`Gerado em: ${currentDateTime}`);
    doc.text(`Gerado em: ${currentDateTime}`, (pageWidth - dateWidth) / 2, currentY);
    currentY += 10;

    // Conteúdo
    doc.setFontSize(10);
    const leftMargin = margin;
    const rightColumnX = pageWidth / 2 + 10; // Posição X para a coluna da direita
    const lineHeight = 7;

    const addLine = (label: string, value: string | undefined | null, column: 'left' | 'right' = 'left') => {
      const x = column === 'left' ? leftMargin : rightColumnX;
      
      // Título em negrito
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, x, currentY);
      
      // Valor em fonte normal
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value || '-'}`, x + labelWidth, currentY);
      
      if (column === 'right') {
        currentY += lineHeight;
      }
    };

    // Primeira linha
    addLine('Nome', user.name, 'left');
    addLine('CPF', user.cpf, 'right');

    // Segunda linha
    addLine('RG', user.rg, 'left');
    addLine('Email', user.email, 'right');

    // Terceira linha
    addLine('Data de Nascimento', user.birthDate ? formatDate(user.birthDate) : null, 'left');
    addLine('Telefone', user.phone, 'right');

    // Quarta linha
    addLine('Endereço', user.address, 'left');
    addLine('Processo', user.processNumber, 'right');

    // Quinta linha
    addLine('Matricula', user.registrationNumber, 'left');    
    addLine('Tipo de Benefício', user.benefitType, 'right');

    // Sexta linha
    addLine('Data Início do Benefício', user.benefitStartDate ? formatDate(user.benefitStartDate) : null, 'left');
    addLine('Data Fim do Benefício', user.benefitEndDate, 'right');

    // Informações do evento e status em linhas únicas
    currentY += lineHeight;
    addLine('Evento', proof.event.title, 'left');
    addLine('Data/Hora do Envio', formatDate(proof.createdAt, true), 'right');

    addLine('Status', statusLabels[proof.status], 'left');
    if (proof.reviewedAt) {
      addLine('Data/Hora da Revisão', formatDate(proof.reviewedAt, true), 'right');
    }

    if (proof.reviewedBy) {
      currentY += lineHeight;
      addLine('Revisado por', proof.reviewedBy, 'left');
    }

    if (proof.comments) {
      currentY += lineHeight;
      addLine('Observações', proof.comments, 'left');
    }

    // Histórico
    currentY += 5;
    doc.setFont('helvetica', 'bold');
    doc.text('Histórico:', leftMargin, currentY);
    currentY += lineHeight;
    doc.setFont('helvetica', 'normal');

    history.forEach((item) => {
      const text = `${formatDate(item.created_at, true)} - ${item.action_description}${item.reviewer_name ? ` por ${item.reviewer_name}` : ''}`;
      if (item.comments && item.comments !== item.action_description) {
        doc.text(text, leftMargin, currentY);
        currentY += lineHeight;
        doc.text(`Observações: ${item.comments}`, leftMargin, currentY);
        currentY += lineHeight + 2;
      } else {
        doc.text(text, leftMargin, currentY);
        currentY += lineHeight;
      }
    });

    // Imagens
    currentY += 10;
    const imageWidth = 45; // Reduzido de 50 para 45
    const imageSpacing = 10; // Espaço entre as imagens reduzido de 20 para 10
    
    doc.setFont('helvetica', 'bold');
    doc.text('Documentos:', leftMargin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');

    // Selfie
    doc.text('Selfie:', leftMargin, currentY);
    currentY += 5;
    doc.addImage(getImageUrl(proof.selfieUrl), 'JPEG', leftMargin, currentY, imageWidth, imageWidth);
    
    // Documento (Frente)
    doc.text('Documento (Frente):', leftMargin + imageWidth + imageSpacing, currentY - 5);
    doc.addImage(getImageUrl(proof.documentFrontUrl), 'JPEG', leftMargin + imageWidth + imageSpacing, currentY, imageWidth, imageWidth);

    // Documento (Verso)
    doc.text('Documento (Verso):', leftMargin + (imageWidth + imageSpacing) * 2, currentY - 5);
    doc.addImage(getImageUrl(proof.documentBackUrl), 'JPEG', leftMargin + (imageWidth + imageSpacing) * 2, currentY, imageWidth, imageWidth);

    // Rodapé
    try {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const footerY = pageHeight - 10;
      
      if (organization) {
        // Primeira linha do rodapé
        const addressLine = `${organization.address || ''}, ${organization.city || ''}-${organization.state || ''}`;
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
      }
    } catch (error) {
      console.error('Erro ao adicionar rodapé:', error);
    }

    // Salvar
    doc.save(`prova-de-vida-${user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <>
      {/* Modal principal */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

          <div className="fixed inset-0 z-50 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={handleCloseModal}
                    >
                      <span className="sr-only">Fechar</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>

                  {/* Conteúdo do modal */}
                  <div className="mt-3 sm:mt-0">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 mb-6"
                    >
                      Revisar Prova de Vida
                    </Dialog.Title>

                    {/* Imagens da prova de vida */}
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <ProofImage
                        imageUrl={proof.selfieUrl}
                        label="Selfie"
                      />
                      <ProofImage
                        imageUrl={proof.documentFrontUrl}
                        label="Frente do Documento"
                      />
                      <ProofImage
                        imageUrl={proof.documentBackUrl}
                        label="Verso do Documento"
                      />
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-8">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">DADOS PESSOAIS</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Nome:</span> {user.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">CPF:</span> {user.cpf}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">RG:</span> {user.rg}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {user.email || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data de Nascimento:</span>{' '}
                            {user.birthDate ? formatDate(user.birthDate) : '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Telefone:</span> {user.phone || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Endereço:</span> {user.address || '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">DADOS DO BENEFÍCIO</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Processo:</span> {user.processNumber || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Matrícula:</span> {user.registrationNumber || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data Início do Benefício:</span>{' '}
                            {user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data Fim do Benefício:</span>{' '}
                            {user.benefitEndDate || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Tipo de Benefício:</span> {user.benefitType || '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">DADOS DA PROVA DE VIDA</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Evento:</span> {proof.event.title}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data/Hora do Envio:</span>{' '}
                            {formatDate(proof.createdAt, true)}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Status:</span> {statusLabels[proof.status]}
                          </p>
                          {proof.reviewedAt && (
                            <p className="text-sm">
                              <span className="font-medium">Data/Hora da Revisão:</span>{' '}
                              {formatDate(proof.reviewedAt, true)}
                            </p>
                          )}
                          {proof.reviewedBy && (
                            <p className="text-sm">
                              <span className="font-medium">Revisado por:</span> {proof.reviewedBy}
                            </p>
                          )}
                          {proof.comments && (
                            <p className="text-sm">
                              <span className="font-medium">Observações:</span> {proof.comments}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Histórico */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900">Histórico</h3>
                      <div className="mt-2 flow-root">
                        <ul role="list" className="-mb-8">
                          {history.map((item, itemIdx) => (
                            <li key={item.id}>
                              <div className="relative pb-8">
                                {itemIdx !== history.length - 1 ? (
                                  <span
                                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                    aria-hidden="true"
                                  />
                                ) : null}
                                <div className="relative flex space-x-3">
                                  <div>
                                    <span className={clsx(
                                      'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                                      item.action === 'APPROVED' ? 'bg-green-500' :
                                      item.action === 'REJECTED' ? 'bg-red-500' :
                                      'bg-blue-500'
                                    )}>
                                      {item.action === 'APPROVED' && (
                                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {item.action === 'REJECTED' && (
                                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                      {(item.action === 'SUBMITTED' || item.action === 'RESUBMITTED') && (
                                        <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex min-w-0 flex-1 justify-between space-x-4">
                                    <div>
                                      <p className="text-sm text-gray-500">
                                        {item.action_description}
                                        {item.reviewer_name ? ` por ${item.reviewer_name}` : ''}
                                      </p>
                                      {item.comments && item.comments !== item.action_description && (
                                        <p className="mt-1 text-sm text-gray-700">{item.comments}</p>
                                      )}
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                      <time dateTime={item.created_at}>
                                        {formatDate(item.created_at, true)}
                                      </time>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Ferramenta de Debug */}
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900">Ferramenta de Debug</h3>
                      <div className="mt-2">
                        <DebugImageTool isOpen={true} />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleExportPDF}
                      >
                        Exportar PDF
                      </Button>
                    </div>

                    {/* Formulário de Decisão */}
                    {proof.status === 'SUBMITTED' ? (
                      <form
                        className="mt-4 space-y-6"
                        onSubmit={handleSubmit(async (data) => {
                          try {
                            console.log('Enviando dados:', {
                              status: data.status,
                              comments: data.comments || undefined
                            });
                            await api.put(`/proof-of-life/${proof.id}/review`, {
                              status: data.status,
                              comments: data.comments || undefined
                            });
                            handleCloseModal();
                            window.location.reload();
                          } catch (error) {
                            console.error('Erro ao revisar prova de vida:', error);
                          }
                        })}
                      >
                        <div>
                          <label
                            htmlFor="status"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Decisão
                          </label>
                          <div className="mt-2">
                            <Controller
                              control={control}
                              name="status"
                              render={({ field }) => (
                                <Select
                                  options={statusOptions}
                                  value={field.value}
                                  onChange={field.onChange}
                                  error={errors.status?.message}
                                />
                              )}
                            />
                          </div>
                        </div>

                        {selectedStatus === 'REJECTED' && (
                          <div>
                            <label
                              htmlFor="comments"
                              className="block text-sm font-medium leading-6 text-gray-900"
                            >
                              Motivo da Rejeição
                            </label>
                            <div className="mt-2">
                              <Input
                                id="comments"
                                {...register('comments')}
                                error={errors.comments?.message}
                              />
                            </div>
                          </div>
                        )}

                        <div className="mt-6 flex justify-end gap-2">
                          <Button
                            type="submit"
                            variant="primary"
                            disabled={!selectedStatus}
                          >
                            {selectedStatus === 'APPROVED' ? 'Aprovar' : 'Rejeitar'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleCloseModal}
                          >
                            Fechar
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="mt-4">
                        <div className="rounded-lg bg-gray-50 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-500">
                                Status:
                              </span>
                              <span
                                className={clsx(
                                  'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                                  {
                                    'bg-green-100 text-green-700':
                                      proof.status === 'APPROVED',
                                    'bg-red-100 text-red-700':
                                      proof.status === 'REJECTED',
                                    'bg-yellow-100 text-yellow-700':
                                      proof.status === 'PENDING'
                                  }
                                )}
                              >
                                {statusLabels[proof.status]}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleCloseModal}
                            >
                              Fechar
                            </Button>
                          </div>

                          {proof.comments && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-500">
                                Observações:
                              </span>
                              <p className="mt-1 text-sm text-gray-700">{proof.comments}</p>
                            </div>
                          )}

                          {proof.reviewedAt && (
                            <div className="mt-2 text-sm text-gray-500">
                              Revisado em {formatDate(proof.reviewedAt, true)}
                              {proof.reviewedBy && ` por ${proof.reviewedBy}`}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Imagem expandida (fora do modal principal) */}
      {expandedImageData && (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="relative">
              <button
                type="button"
                className="absolute -top-2 -right-2 z-[9999] rounded-full bg-white p-1.5 text-gray-900 shadow-lg hover:text-gray-600 focus:outline-none"
                onClick={() => setExpandedImageData(null)}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <img
                src={getImageUrl(expandedImageData.url)}
                alt={expandedImageData.label}
                className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = '/placeholder-image.png';
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}