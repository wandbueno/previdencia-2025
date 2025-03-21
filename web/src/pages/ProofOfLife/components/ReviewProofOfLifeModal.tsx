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
import { formatDate } from '@/utils/format';

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
  cpfUrl: string;
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
    return 'https://previdencia-2025-plw27a.fly.dev/placeholder-image.png';
  }

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

  // Limpar caminho
  let cleanPath = path;
  
  // Remover referências a diretórios superiores (../../)
  if (cleanPath.includes('../')) {
    // Extrair apenas a parte do caminho que importa
    const parts = cleanPath.split('data/uploads/');
    if (parts.length > 1) {
      cleanPath = parts[1]; // Pegar apenas o caminho após data/uploads/
    } else {
      // Tentar outra abordagem para extrair as partes importantes do caminho
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
      const matches = cleanPath.match(uuidPattern);
      
      if (matches && matches.length >= 2) {
        // Pegar tudo a partir do primeiro UUID encontrado
        const startIdx = cleanPath.indexOf(matches[0]);
        if (startIdx !== -1) {
          cleanPath = cleanPath.substring(startIdx);
        }
      }
    }
  }
  
  // Remover o prefixo /uploads/ ou uploads/ se existir
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(9); // Remove '/uploads/'
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.substring(8); // Remove 'uploads/'
  }
  
  // Se ainda contiver data/uploads/, remover também
  if (cleanPath.startsWith('data/uploads/')) {
    cleanPath = cleanPath.substring(13);
  } else if (cleanPath.startsWith('/data/uploads/')) {
    cleanPath = cleanPath.substring(14);
  }
  
  // Remover qualquer barra extra no início
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  console.log('Caminho limpo:', cleanPath);
  
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

function formatCPF(cpf: string) {
  return `${cpf.substring(0, 3)}.${cpf.substring(3, 6)}.${cpf.substring(6, 9)}-${cpf.substring(9, 11)}`;
}

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

export function ReviewProofOfLifeModal({ proof, open, onClose }: ReviewProofOfLifeModalProps) {
  const [expandedImageData, setExpandedImageData] = useState<{ url: string; label: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  useEffect(() => {
    if (open && proof.id) {
      console.log('Dados recebidos do backend:', proof);
      console.log('Caminhos de imagem recebidos:', proof.selfieUrl, proof.documentFrontUrl, proof.documentBackUrl, proof.cpfUrl);
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

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 14;
    let currentY = margin;
    let organizationData: any = null;

    try {
      // Buscar informações da organização
      const currentUser = getUser();
      if (!currentUser?.organization) {
        throw new Error('Informações da organização não encontradas');
      }

      const { data: organizations } = await api.get('/organizations/public');
      organizationData = organizations.find((org: any) => org.id === currentUser.organization?.id);

      if (!organizationData) {
        throw new Error('Detalhes da organização não encontrados');
      } else {
        organizationData.logo = getImageUrl(organizationData.logo_url);
      }

      if (organizationData.logo) {
        try {
          const logoUrl = organizationData.logo;
          
          console.log('Logo URL completa:', logoUrl);
          console.log('Tentando carregar logo para PDF a partir de:', logoUrl);

          const { dataUrl: pngData, width: originalWidth, height: originalHeight } = await convertWebPToPNG(logoUrl);
          
          const maxSize = 25;
          const aspectRatio = originalWidth / originalHeight;
          
          let imgWidth, imgHeight;
          if (originalWidth > originalHeight) {
            imgWidth = maxSize;
            imgHeight = maxSize / aspectRatio;
          } else {
            imgWidth = maxSize * aspectRatio;
            imgHeight = maxSize;
          }
          
          const imgX = (pageWidth - imgWidth) / 2;
          doc.addImage(pngData, 'PNG', imgX, currentY, imgWidth, imgHeight, undefined, 'FAST');
          currentY += imgHeight + 6;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          const orgName = organizationData.name || currentUser.organization?.name || '';
          const textWidth = doc.getTextWidth(orgName);
          const textX = (pageWidth - textWidth) / 2;
          doc.text(orgName, textX, currentY);
          currentY += 10;
        } catch (error) {
          console.error('Erro ao adicionar logo:', error);
          console.error('Detalhes completos do erro (URL da logo):', organizationData.logo);
          console.error('Caminho original da logo:', organizationData.logo_url);
          
          try {
            const apiBaseUrl = import.meta.env.VITE_API_URL
              ? import.meta.env.VITE_API_URL.replace('/api', '')
              : 'https://previdencia-2025-plw27a.fly.dev';
            
            const alternativeLogoUrl = `${apiBaseUrl}/uploads/logos/${organizationData.logo_url.split('/').pop()}`;
            console.log('Tentando caminho alternativo para logo:', alternativeLogoUrl);
            
            const { dataUrl: pngData, width: originalWidth, height: originalHeight } = await convertWebPToPNG(alternativeLogoUrl);
            
            const maxSize = 25;
            const aspectRatio = originalWidth / originalHeight;
            
            let imgWidth, imgHeight;
            if (originalWidth > originalHeight) {
              imgWidth = maxSize;
              imgHeight = maxSize / aspectRatio;
            } else {
              imgWidth = maxSize * aspectRatio;
              imgHeight = maxSize;
            }
            
            const imgX = (pageWidth - imgWidth) / 2;
            doc.addImage(pngData, 'PNG', imgX, currentY, imgWidth, imgHeight, undefined, 'FAST');
            currentY += imgHeight + 6;
            
            console.log('Logo alternativa adicionada com sucesso ao PDF');
          } catch (fallbackError) {
            console.error('Erro também no caminho alternativo da logo:', fallbackError);
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            const orgName = organizationData.name || currentUser.organization?.name || '';
            const textWidth = doc.getTextWidth(orgName);
            const textX = (pageWidth - textWidth) / 2;
            doc.text(orgName, textX, currentY);
            currentY += 10;
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar informações da organização:', error);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const title = `DETALHES DA PROVA DE VIDA DE ${user.name.toUpperCase()}`;
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, currentY);
    currentY += 10;

    doc.setFontSize(9);
    const currentDateTime = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", {
      locale: ptBR
    });
    const dateWidth = doc.getTextWidth(`Gerado em: ${currentDateTime}`);
    doc.text(`Gerado em: ${currentDateTime}`, (pageWidth - dateWidth) / 2, currentY);
    currentY += 10;

    doc.setFontSize(10);
    const leftMargin = margin;
    const rightColumnX = pageWidth / 2 + 10;
    const lineHeight = 7;

    const addLine = (label: string, value: string | undefined | null, column: 'left' | 'right' = 'left') => {
      const x = column === 'left' ? leftMargin : rightColumnX;
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, x, currentY);
      
      const labelWidth = doc.getTextWidth(`${label}: `);
      doc.setFont('helvetica', 'normal');
      doc.text(`${value || '-'}`, x + labelWidth, currentY);
      
      if (column === 'right') {
        currentY += lineHeight;
      }
    };

    addLine('Nome', user.name, 'left');
    addLine('CPF', formatCPF(user.cpf), 'right');

    addLine('RG', user.rg, 'left');
    addLine('Email', user.email, 'right');

    addLine('Data de Nascimento', user.birthDate ? formatDate(user.birthDate) : null, 'left');
    addLine('Telefone', user.phone, 'right');

    addLine('Endereço', user.address, 'left');
    addLine('Processo', user.processNumber, 'right');

    addLine('Matricula', user.registrationNumber, 'left');    
    addLine('Tipo de Benefício', user.benefitType, 'right');

    addLine('Data Início do Benefício', user.benefitStartDate ? formatDate(user.benefitStartDate) : null, 'left');
    addLine('Data Fim do Benefício', user.benefitEndDate, 'right');

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
        
        const maxWidth = pageWidth - (2 * leftMargin);
        const commentLines = doc.splitTextToSize(`Observações: ${item.comments}`, maxWidth);
        doc.text(commentLines, leftMargin, currentY);
        
        currentY += lineHeight * commentLines.length + 2;
      } else {
        doc.text(text, leftMargin, currentY);
        currentY += lineHeight;
      }
    });

    currentY += 10;
    const imageWidth = 40; // Reduzido para caber 4 imagens
    const imageSpacing = 5; // Reduzido o espaçamento
    
    doc.setFont('helvetica', 'bold');
    doc.text('Documentos:', leftMargin, currentY);
    currentY += 7;
    doc.setFont('helvetica', 'normal');

    // Calcular posição X para centralizar as 4 imagens
    const totalWidth = (imageWidth * 4) + (imageSpacing * 3);
    const startX = (pageWidth - totalWidth) / 2;

    // Selfie
    doc.text('Selfie:', startX, currentY - 5);
    doc.addImage(getImageUrl(proof.selfieUrl), 'JPEG', startX, currentY, imageWidth, imageWidth);

    // Documento (Frente)
    doc.text('Frente:', startX + imageWidth + imageSpacing, currentY - 5);
    doc.addImage(getImageUrl(proof.documentFrontUrl), 'JPEG', startX + imageWidth + imageSpacing, currentY, imageWidth, imageWidth);

    // Documento (Verso)
    doc.text('Verso:', startX + (imageWidth + imageSpacing) * 2, currentY - 5);
    doc.addImage(getImageUrl(proof.documentBackUrl), 'JPEG', startX + (imageWidth + imageSpacing) * 2, currentY, imageWidth, imageWidth);

    // CPF
    doc.text('CPF:', startX + (imageWidth + imageSpacing) * 3, currentY - 5);
    doc.addImage(getImageUrl(proof.cpfUrl), 'JPEG', startX + (imageWidth + imageSpacing) * 3, currentY, imageWidth, imageWidth);

    try {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const footerY = pageHeight - 10;
      
      if (organizationData) {
        const addressLine = `${organizationData.address || ''}, ${organizationData.city || ''}-${organizationData.state || ''}`;
        const cepLine = organizationData.cep ? `, CEP: ${organizationData.cep}` : '';
        doc.text(addressLine + cepLine, pageWidth/2, footerY - 6, { align: 'center' });
        
        if (organizationData.phone || organizationData.email || organizationData.cnpj) {
          const contactParts = [];
          if (organizationData.phone) contactParts.push(`Tel: ${formatPhone(organizationData.phone)}`);
          if (organizationData.email) contactParts.push(`Email: ${organizationData.email}`);
          if (organizationData.cnpj) contactParts.push(`CNPJ: ${formatCNPJ(organizationData.cnpj)}`);
          
          const contactLine = contactParts.join(' | ');
          doc.text(contactLine, pageWidth/2, footerY - 2, { align: 'center' });
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar rodapé:', error);
    }

    doc.save(`prova-de-vida-${user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  const handleCloseModal = () => {
    onClose();
  };
  
  return (
    <>
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
                <Dialog.Panel className="relative transform rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-5xl sm:p-6">
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

                  <div className="mt-3 sm:mt-0">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900 mb-6"
                    >
                      Revisar Prova de Vida
                    </Dialog.Title>

                    <div className="mt-4 grid grid-cols-4 gap-2">
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
                      <ProofImage
                        imageUrl={proof.cpfUrl}
                        label="CPF"
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
                            <span className="font-medium">CPF:</span> {formatCPF(user.cpf)}
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
                        </div>
                      </div>
                    </div>

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

                    <div className="mt-6 flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleExportPDF}
                      >
                        Exportar PDF
                      </Button>
                    </div>

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