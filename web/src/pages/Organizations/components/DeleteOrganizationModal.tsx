import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';

interface Organization {
  id: string;
  name: string;
}

interface DeleteOrganizationModalProps {
  organization: Organization;
  open: boolean;
  onClose: () => void;
}

export function DeleteOrganizationModal({ organization, open, onClose }: DeleteOrganizationModalProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteOrganization, isPending } = useMutation({
    mutationFn: async () => {
      await api.delete(`/organizations/${organization.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organização excluída com sucesso!');
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Erro ao excluir organização'
      );
    }
  });

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
                    Excluir Organização
                  </Dialog.Title>

                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Tem certeza que deseja excluir a organização "{organization.name}"? Esta ação não pode ser desfeita.
                    </p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      loading={isPending}
                      onClick={() => deleteOrganization()}
                    >
                      Excluir
                    </Button>
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