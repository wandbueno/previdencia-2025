import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  documentUrl: string;
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
    console.error('Error formatting date:', error);
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

function getImageUrl(path: string) {
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
  return `${baseUrl}/uploads/${path}`;
}

export function ReviewProofOfLifeModal({ proof, open, onClose }: ReviewProofOfLifeModalProps) {
  const queryClient = useQueryClient();
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

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
      handleClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao revisar prova de vida'
      );
    }
  });

  function handleClose() {
    reset();
    onClose();
  }

  function handleExpandedImageClose(e: React.MouseEvent) {
    e.stopPropagation();
    setExpandedImage(null);
  }

  const handleExportPDF = async () => {
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
    
    doc.text('Documento:', leftMargin + imageWidth + 20, y);
    doc.addImage(getImageUrl(proof.documentUrl), 'JPEG', leftMargin + imageWidth + 20, y + 5, imageWidth, imageWidth);

    doc.save(`prova-de-vida-${proof.user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
  };

  return (
    <>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900"
                      >
                        {proof.status === 'SUBMITTED' ? 'Revisar' : 'Detalhes da'} Prova de Vida
                      </Dialog.Title>

                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportPDF}
                      >
                        Exportar PDF
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-8">
                      {/* Coluna 1 - Dados Pessoais */}
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

                      {/* Coluna 2 - Dados do Benefício */}
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

                      {/* Coluna 3 - Dados da Prova de Vida */}
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

                    <div className="mt-6 grid grid-cols-2 gap-8">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Selfie</h4>
                        <div 
                          className="cursor-pointer"
                          onClick={() => setExpandedImage(proof.selfieUrl)}
                        >
                          <img
                            src={getImageUrl(proof.selfieUrl)}
                            alt="Selfie"
                            className="w-1/2 aspect-square rounded-lg object-cover hover:opacity-75 transition-opacity"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-4">Documento</h4>
                        <div 
                          className="cursor-pointer"
                          onClick={() => setExpandedImage(proof.documentUrl)}
                        >
                          <img
                            src={getImageUrl(proof.documentUrl)}
                            alt="Documento"
                            className="w-1/2 aspect-square rounded-lg object-cover hover:opacity-75 transition-opacity"
                          />
                        </div>
                      </div>
                    </div>

                    {proof.status === 'SUBMITTED' && (
                      <form
                        className="mt-6 space-y-6"
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

                        <div className="flex justify-end gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            variant={selectedStatus === 'APPROVED' ? 'primary' : 'secondary'}
                            loading={isPending}
                          >
                            {selectedStatus === 'APPROVED' ? 'Aprovar' : 'Rejeitar'}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Expanded Image Modal */}
      <Transition.Root show={!!expandedImage} as={Fragment}>
        <Dialog 
          as="div" 
          className="relative z-[60]" 
          onClose={() => setExpandedImage(null)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-white hover:text-gray-200"
                    onClick={handleExpandedImageClose}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  <img
                    src={expandedImage ? getImageUrl(expandedImage) : ''}
                    alt="Imagem expandida"
                    className="max-h-[80vh] w-auto"
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}