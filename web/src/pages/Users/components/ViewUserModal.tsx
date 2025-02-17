import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User, UserTableType } from '@/types/user';
import { formatDate, formatCPF, formatPhone } from '@/utils/format';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
  user: User | null;
  type: UserTableType;
}

export function ViewUserModal({ open, onClose, user, type }: ViewUserModalProps) {
  if (!user) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(`Detalhes do ${type === 'admin' ? 'Administrador' : 'Usuário'}`, 14, 20);

    // Prepare data for table
    const data = [
      ['Nome', user.name],
      ['CPF', formatCPF(user.cpf)],
      ['Email', user.email || '-'],
      ['Status', user.active ? 'Ativo' : 'Inativo']
    ];

    if (type === 'app') {
      data.push(
        ['RG', user.rg || '-'],
        ['Data de Nascimento', user.birthDate ? formatDate(user.birthDate) : '-'],
        ['Endereço', user.address || '-'],
        ['Telefone', user.phone ? formatPhone(user.phone) : '-'],
        ['Matrícula', user.registrationNumber || '-'],
        ['Processo', user.processNumber || '-'],
        ['Tipo de Benefício', user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'],
        ['Data Início do Benefício', user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'],
        ['Data Fim do Benefício', user.benefitEndDate || '-']
      );

      if (user.benefitType === 'APOSENTADORIA') {
        data.push(['Tipo de Aposentadoria', user.retirementType || '-']);
      }

      if (user.benefitType === 'PENSAO') {
        data.push(['Nome do Instituidor', user.insuredName || '-']);
      }
    }

    // Add table
    (doc as any).autoTable({
      startY: 30,
      body: data,
      theme: 'striped',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 100 }
      }
    });

    // Save PDF
    doc.save(`detalhes-${user.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <Dialog.Title as="h3" className="text-lg font-semibold text-gray-900">
                      Detalhes do {type === 'admin' ? 'Administrador' : 'Usuário'}
                    </Dialog.Title>
                    <Button variant="outline" onClick={onClose}>
                      Fechar
                    </Button>
                  </div>

                  <div className="mt-4 space-y-6">
                    {/* Informações Básicas */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Informações Básicas</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Nome</p>
                          <p className="mt-1 text-sm text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">CPF</p>
                          <p className="mt-1 text-sm text-gray-900">{formatCPF(user.cpf)}</p>
                        </div>
                        {user.rg && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">RG</p>
                            <p className="mt-1 text-sm text-gray-900">{user.rg}</p>
                          </div>
                        )}
                        {user.birthDate && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Data de Nascimento</p>
                            <p className="mt-1 text-sm text-gray-900">{formatDate(user.birthDate)}</p>
                          </div>
                        )}
                        {user.email && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Email</p>
                            <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                          </div>
                        )}
                        {user.phone && (
                          <div>
                            <p className="text-sm font-medium text-gray-500">Telefone</p>
                            <p className="mt-1 text-sm text-gray-900">{formatPhone(user.phone)}</p>
                          </div>
                        )}
                        {user.address && (
                          <div className="sm:col-span-2">
                            <p className="text-sm font-medium text-gray-500">Endereço</p>
                            <p className="mt-1 text-sm text-gray-900">{user.address}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className="mt-1 text-sm text-gray-900">{user.active ? 'Ativo' : 'Inativo'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações do Benefício (apenas para usuários do app) */}
                    {type === 'app' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">Informações do Benefício</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-gray-500">Tipo de Benefício</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
                            </p>
                          </div>
                          {user.benefitType === 'APOSENTADORIA' && user.retirementType && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Tipo de Aposentadoria</p>
                              <p className="mt-1 text-sm text-gray-900">{user.retirementType}</p>
                            </div>
                          )}
                          {user.benefitType === 'PENSAO' && user.insuredName && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Nome do Instituidor</p>
                              <p className="mt-1 text-sm text-gray-900">{user.insuredName}</p>
                            </div>
                          )}
                          {user.registrationNumber && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Matrícula</p>
                              <p className="mt-1 text-sm text-gray-900">{user.registrationNumber}</p>
                            </div>
                          )}
                          {user.processNumber && (
                            <div>
                              <p className="text-sm font-medium text-gray-500">Processo</p>
                              <p className="mt-1 text-sm text-gray-900">{user.processNumber}</p>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-500">Data Início do Benefício</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-500">Data Fim do Benefício</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {user.benefitEndDate || '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botão de Exportar */}
                  <div className="mt-6 flex justify-center">
                    <Button onClick={handleExportPDF} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Exportar PDF
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