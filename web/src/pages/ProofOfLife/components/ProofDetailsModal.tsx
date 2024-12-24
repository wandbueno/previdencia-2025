import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { toast } from 'react-hot-toast';
import { getUser } from '@/utils/auth';

interface ProofDetailsModalProps {
  proof: {
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
    reviewedBy?: string;
  };
  open: boolean;
  onClose: () => void;
}

export function ProofDetailsModal({ proof, open, onClose }: ProofDetailsModalProps) {
  const user = getUser();
  const queryClient = useQueryClient();
  const [comments, setComments] = useState('');
  
  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: async ({ status }: { status: 'APPROVED' | 'REJECTED' }) => {
      const response = await api.put(`/proof-of-life/${proof.id}/review`, {
        status,
        comments
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proof-of-life'] });
      toast.success('Status atualizado com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar status');
    }
  });

  const handleStatusChange = (newStatus: 'APPROVED' | 'REJECTED') => {
    if (confirm(`Tem certeza que deseja ${newStatus === 'APPROVED' ? 'aprovar' : 'rejeitar'} esta prova de vida?`)) {
      updateStatus({ status: newStatus });
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
            <Dialog.Panel className="relative w-full max-w-2xl rounded-lg bg-white p-6">
              <Dialog.Title className="text-lg font-semibold">
                Detalhes da Prova de Vida
              </Dialog.Title>

              <div className="mt-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Usuário</h4>
                    <p className="mt-1">{proof.user.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">CPF</h4>
                    <p className="mt-1">{proof.user.cpf}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Data de Envio</h4>
                    <p className="mt-1">
                      {new Date(proof.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <p className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium
                      ${proof.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                        proof.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'}`}
                    >
                      {proof.status === 'PENDING' ? 'Pendente' : 
                        proof.status === 'APPROVED' ? 'Aprovado' : 
                        'Rejeitado'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Imagens</h4>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Selfie</p>
                      <img
                        src={proof.selfieUrl}
                        alt="Selfie"
                        className="mt-1 h-48 w-full rounded-lg object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Documento</p>
                      <img
                        src={proof.documentUrl}
                        alt="Documento"
                        className="mt-1 h-48 w-full rounded-lg object-cover"
                      />
                    </div>
                  </div>
                </div>

                {proof.comments && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Observações</h4>
                    <p className="mt-1 text-sm text-gray-700">{proof.comments}</p>
                  </div>
                )}

                {proof.reviewedAt && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Revisado em</h4>
                      <p className="mt-1">
                        {new Date(proof.reviewedAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {proof.reviewedBy && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Revisado por</h4>
                        <p className="mt-1">{proof.reviewedBy}</p>
                      </div>
                    )}
                  </div>
                )}

                {user?.role === 'ORGANIZATION_ADMIN' && proof.status === 'PENDING' && (
                  <div className="mt-6 space-y-4 border-t pt-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Observações da Revisão</h4>
                      <textarea
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        rows={3}
                        placeholder="Adicione observações sobre a revisão..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button
                        onClick={() => handleStatusChange('APPROVED')}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        loading={isPending}
                      >
                        Aprovar
                      </Button>
                      <Button
                        onClick={() => handleStatusChange('REJECTED')}
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        loading={isPending}
                      >
                        Rejeitar
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 