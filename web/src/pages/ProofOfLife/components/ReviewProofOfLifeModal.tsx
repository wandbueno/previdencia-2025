import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

interface ProofOfLife {
  id: string;
  user: {
    name: string;
    cpf: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  selfieUrl: string;
  documentUrl: string;
  comments?: string;
  createdAt: string;
  reviewedAt?: string;
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

export function ReviewProofOfLifeModal({ proof, open, onClose }: ReviewProofOfLifeModalProps) {
  const queryClient = useQueryClient();

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

  return (
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-gray-900"
                  >
                    Revisar Prova de Vida
                  </Dialog.Title>

                  <div className="mt-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Usuário:</span> {proof.user.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">CPF:</span> {proof.user.cpf}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Data de Envio:</span>{' '}
                        {new Date(proof.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Selfie</h4>
                        <img
                          src={proof.selfieUrl}
                          alt="Selfie"
                          className="mt-2 aspect-square w-full rounded-lg object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Documento</h4>
                        <img
                          src={proof.documentUrl}
                          alt="Documento"
                          className="mt-2 aspect-square w-full rounded-lg object-cover"
                        />
                      </div>
                    </div>

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

                      <div className="mt-6 flex justify-end gap-3">
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
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}