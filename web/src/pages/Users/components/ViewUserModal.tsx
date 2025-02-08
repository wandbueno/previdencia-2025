// web/src/pages/Users/components/ViewUserModal.tsx
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '@/types/user';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
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
    doc.text('Detalhes do Usuário', 14, 20);

    // Prepare data for table
    const userData = [
      ['Nome', user.name],
      ['CPF', user.cpf],
      ['RG', user.rg || '-'],
      ['Email', user.email || '-'],
      ['Telefone', user.phone || '-'],
      ['Data de Nascimento', user.birthDate ? formatDate(user.birthDate) : '-'],
      ['Endereço', user.address || '-'],
      ['Matrícula', user.registrationNumber || '-'],
      ['Processo', user.processNumber || '-'],
      ['Data Início do Benefício', user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'],
      ['Data Fim do Benefício', user.benefitEndDate || '-'],
      ['Tipo de Benefício', user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 
                           user.benefitType === 'PENSAO' ? 'Pensão' : '-'],
      ['Tipo de Aposentadoria', user.retirementType || '-'],
      ['Nome do Segurado', user.insuredName || '-'],
      ['Representante Legal', user.legalRepresentative || '-'],
      ['Status', user.active ? 'Ativo' : 'Inativo'],
      ['Data de Cadastro', formatDate(user.createdAt)]
    ];

    // Add table
    (doc as any).autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: userData,
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] }, // Primary blue color
      styles: { fontSize: 10 }
    });

    // Save PDF
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-[800px] sm:p-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Detalhes do Usuário
                    </Dialog.Title>

                    <Button
                      variant="outline"
                      onClick={handleExportPDF}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Nome</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">CPF</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.cpf}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">RG</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.rg || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.email || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Telefone</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.phone || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data de Nascimento</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.birthDate ? formatDate(user.birthDate) : '-'}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <h4 className="text-sm font-medium text-gray-500">Endereço</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.address || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Matrícula</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.registrationNumber || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Processo</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.processNumber || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data Início do Benefício</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data Fim do Benefício</h4>
                      <p className="mt-1 text-sm text-gray-900">{user.benefitEndDate || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tipo de Benefício</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 
                         user.benefitType === 'PENSAO' ? 'Pensão' : '-'}
                      </p>
                    </div>

                    {user.benefitType === 'APOSENTADORIA' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Tipo de Aposentadoria</h4>
                        <p className="mt-1 text-sm text-gray-900">{user.retirementType || '-'}</p>
                      </div>
                    )}

                    {user.benefitType === 'PENSAO' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Nome do Segurado</h4>
                        <p className="mt-1 text-sm text-gray-900">{user.insuredName || '-'}</p>
                      </div>
                    )}

                    {user.legalRepresentative && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Representante Legal</h4>
                        <p className="mt-1 text-sm text-gray-900">{user.legalRepresentative}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {user.active ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data de Cadastro</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={onClose}>
                      Fechar
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
