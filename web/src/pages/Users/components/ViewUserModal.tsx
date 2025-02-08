// web/src/pages/Users/components/ViewUserModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/format';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ViewUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function ViewUserModal({ user, open, onClose }: ViewUserModalProps) {
  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text('Dados do Usuário', 14, 20);

    // Add user data
    const userData = [
      ['Nome', user.name],
      ['CPF', user.cpf],
      ['Email', user.email || '-'],
      ['RG', user.rg || '-'],
      ['Data de Nascimento', user.birthDate ? formatDate(user.birthDate) : '-'],
      ['Endereço', user.address || '-'],
      ['Telefone', user.phone || '-'],
      ['Matrícula', user.registrationNumber || '-'],
      ['Processo', user.processNumber || '-'],
      ['Data Início do Benefício', user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'],
      ['Data Fim do Benefício', user.benefitEndDate || '-'],
      ['Tipo de Benefício', user.benefitType || '-'],
      ['Tipo de Aposentadoria', user.retirementType || '-'],
      ['Nome do Segurado', user.insuredName || '-'],
      ['Representante Legal', user.legalRepresentative || '-'],
      ['Status', user.active ? 'Ativo' : 'Inativo'],
      ['Data de Cadastro', formatDate(user.createdAt)],
    ];

    doc.autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: userData,
    });

    doc.save(`usuario-${user.cpf}.pdf`);
  };

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
                    className="text-lg font-semibold leading-6 text-gray-900 mb-4"
                  >
                    Detalhes do Usuário
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Nome</span>
                        <p className="mt-1">{user.name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">CPF</span>
                        <p className="mt-1">{user.cpf}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Email</span>
                        <p className="mt-1">{user.email || '-'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">RG</span>
                        <p className="mt-1">{user.rg || '-'}</p>
                      </div>
                      {/* Add more fields as needed */}
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={handleExportPDF}
                      >
                        Exportar PDF
                      </Button>
                      <Button onClick={onClose}>
                        Fechar
                      </Button>
                    </div>
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
