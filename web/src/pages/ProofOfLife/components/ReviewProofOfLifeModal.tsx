import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import clsx from 'clsx';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProofImage } from './ExpandedImage';

const statusLabels = {
  PENDING: 'Pendente',
  SUBMITTED: 'Pendente',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado'
} as const;

interface ProofOfLife {
  id: string;
  user: {
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
  if (!path) return '/placeholder-image.png';
  
  // Se já for uma URL completa, retorna ela mesma
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // A API está servindo os arquivos diretamente da pasta uploads
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  
  // Removemos qualquer barra extra para evitar problemas de caminho
  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  
  return `${baseUrl}/uploads/${cleanPath}`;
}

export function ReviewProofOfLifeModal({ proof, open, onClose }: ReviewProofOfLifeModalProps) {
  const queryClient = useQueryClient();
  const [expandedImageData, setExpandedImageData] = useState<{ url: string; label: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema)
  });

  const selectedStatus = watch('status');

  const { mutate: reviewProof, isPending } = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await api.put(`/proof-of-life/${proof.id}/review`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proof-of-life'] });
      toast.success('Prova de vida revisada com sucesso!');
      handleCloseModal();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao revisar prova de vida'
      );
    }
  });

  // Função específica para fechar o modal principal
  const handleCloseModal = () => {
    reset();
    onClose();
  };

  const handleExportPDF = async (): Promise<void> => {
    const { default: jsPDF } = await import('jspdf');
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Title
    const title = `DETALHES DA PROVA DE VIDA DE ${proof.user.name.toUpperCase()}`;
    doc.setFontSize(16);
    const titleWidth = doc.getTextWidth(title);
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(title, (pageWidth - titleWidth) / 2, 20);

    // Content
    doc.setFontSize(12);
    let y = 40;
    const leftMargin = 20;
    const lineHeight = 7;

    const addLine = (label: string, value: string | undefined | null) => {
      doc.text(`${label}: ${value || '-'}`, leftMargin, y);
      y += lineHeight;
    };

    addLine('Nome', proof.user.name);
    addLine('CPF', proof.user.cpf);
    addLine('RG', proof.user.rg);
    addLine('Email', proof.user.email);
    addLine('Data de Nascimento', proof.user.birthDate ? formatDate(proof.user.birthDate) : null);
    addLine('Telefone', proof.user.phone);
    addLine('Endereço', proof.user.address);

    addLine('Processo', proof.user.processNumber);
    addLine('Matricula', proof.user.registrationNumber);    
    addLine('Data Início do Benefício', proof.user.benefitStartDate ? formatDate(proof.user.benefitStartDate) : null);
    addLine('Data Fim do Benefício', proof.user.benefitEndDate);
    addLine('Tipo de Benefício', proof.user.benefitType);

   
    addLine('Evento', proof.event.title);
    addLine('Data/Hora do Envio', formatDate(proof.createdAt, true));
    addLine('Status', statusLabels[proof.status]);
    if (proof.reviewedAt) {
      addLine('Data/Hora da Revisão', formatDate(proof.reviewedAt, true));
    }
    if (proof.reviewedBy) {
      addLine('Revisado por', proof.reviewedBy);
    }
    if (proof.comments) {
      addLine('Observações', proof.comments);
    }

    // Add images
    y += 10;
    const imageWidth = 80;
    doc.text('Selfie:', leftMargin, y);
    doc.addImage(getImageUrl(proof.selfieUrl), 'JPEG', leftMargin, y + 5, imageWidth, imageWidth);
    
    doc.text('Documento (Frente):', leftMargin, y);
    doc.addImage(getImageUrl(proof.documentFrontUrl), 'JPEG', leftMargin, y + 5, imageWidth, imageWidth);

    doc.text('Documento (Verso):', leftMargin + imageWidth + 20, y);
    doc.addImage(getImageUrl(proof.documentBackUrl), 'JPEG', leftMargin + imageWidth + 20, y + 5, imageWidth, imageWidth);

    doc.save(`prova-de-vida-${proof.user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
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
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados Pessoais</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Nome:</span> {proof.user.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">CPF:</span> {proof.user.cpf}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">RG:</span> {proof.user.rg}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span> {proof.user.email || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data de Nascimento:</span>{' '}
                            {proof.user.birthDate ? formatDate(proof.user.birthDate) : '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Telefone:</span> {proof.user.phone || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Endereço:</span> {proof.user.address || '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados do Benefício</h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Processo:</span> {proof.user.processNumber || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Matricula:</span> {proof.user.registrationNumber || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data Início do Benefício:</span>{' '}
                            {proof.user.benefitStartDate ? formatDate(proof.user.benefitStartDate) : '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Data Fim do Benefício:</span>{' '}
                            {proof.user.benefitEndDate || '-'}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Tipo de Benefício:</span>{' '}
                            {proof.user.benefitType || '-'}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Dados da Prova de Vida</h4>
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

                    <div className="mt-4 flex justify-end gap-2">
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
                        onSubmit={handleSubmit(data => reviewProof(data))}
                      >
                        <div>
                          <label
                            htmlFor="status"
                            className="block text-sm font-medium leading-6 text-gray-900"
                          >
                            Decisão
                          </label>
                          <div className="mt-2">
                            <Select
                              options={statusOptions}
                              onChange={(value) => setValue('status', value as 'APPROVED' | 'REJECTED')}
                              error={errors.status?.message}
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
                            loading={isPending}
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
                                      proof.status === 'REJECTED'
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
                              <p className="mt-1 text-sm text-gray-700">
                                {proof.comments}
                              </p>
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