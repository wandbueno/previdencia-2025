import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User, UserTableType } from '@/types/user';
import { formatDate } from '@/utils/format';
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
      ['CPF', user.cpf],
      ['Email', user.email || '-'],
      ['Status', user.active ? 'Ativo' : 'Inativo']
    ];

    if (type === 'app') {
      data.push(
        ['RG', user.rg || '-'],
        ['Data de Nascimento', user.birthDate ? formatDate(user.birthDate) : '-'],
        ['Endereço', user.address || '-'],
        ['Telefone', user.phone || '-'],
        ['Matrícula', user.registrationNumber || '-'],
        ['Processo', user.processNumber || '-'],
        ['Tipo de Benefício', user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão']
      );

      if (user.benefitType === 'APOSENTADORIA') {
        data.push(['Tipo de Aposentadoria', user.retirementType || '-']);
      }

      if (user.benefitType === 'PENSAO') {
        data.push(['Nome do Instituidor', user.insuredName || '-']);
      }

      data.push(
        ['Data Início do Benefício', formatDate(user.benefitStartDate)],
        ['Data Fim do Benefício', user.benefitEndDate || '-']
      );

      if (user.legalRepresentative) {
        data.push(['Representante Legal', user.legalRepresentative]);
      }

      data.push(
        ['Pode fazer Prova de Vida', user.canProofOfLife ? 'Sim' : 'Não'],
        ['Pode fazer Recadastramento', user.canRecadastration ? 'Sim' : 'Não']
      );
    }

    // Add table
    (doc as any).autoTable({
      startY: 30,
      head: [['Campo', 'Valor']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 10 }
    });

    // Save PDF
    doc.save(`usuario-${user.cpf}-detalhes.pdf`);
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
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Detalhes do {type === 'admin' ? 'Administrador' : 'Usuário'}
                    </Dialog.Title>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportPDF}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportar PDF
                    </Button>
                  </div>

                  <div className="mt-2 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Nome
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {user.name}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          CPF
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {user.cpf}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {user.email || '-'}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="mt-1 text-sm text-gray-900">
                          {user.active ? 'Ativo' : 'Inativo'}
                        </div>
                      </div>

                      {type === 'app' && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Nome
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.name}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              CPF
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.cpf}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              RG
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.rg || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Data de Nascimento
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.birthDate ? formatDate(user.birthDate) : '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Email
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.email || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Telefone
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.phone || '-'}
                            </div>
                          </div>

                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Endereço
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.address || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Matrícula
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.registrationNumber || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Processo
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.processNumber || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Tipo de Benefício
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
                            </div>
                          </div>

                          {user.benefitType === 'APOSENTADORIA' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Tipo de Aposentadoria
                              </label>
                              <div className="mt-1 text-sm text-gray-900">
                                {user.retirementType || '-'}
                              </div>
                            </div>
                          )}

                          {user.benefitType === 'PENSAO' && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">
                                Nome do Instituidor
                              </label>
                              <div className="mt-1 text-sm text-gray-900">
                                {user.insuredName || '-'}
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Data Início do Benefício
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {formatDate(user.benefitStartDate)}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Data Fim do Benefício
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.benefitEndDate || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Representante Legal
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.legalRepresentative || '-'}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Status
                            </label>
                            <div className="mt-1 text-sm text-gray-900">
                              {user.active ? 'Ativo' : 'Inativo'}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-5 sm:mt-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                    onClick={onClose}
                  >
                    Fechar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}