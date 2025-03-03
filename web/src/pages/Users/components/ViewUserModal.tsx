import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User, UserTableType } from '@/types/user';
import { formatDate, formatCPF, formatPhone } from '@/utils/format';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Badge } from '@/components/ui/Badge';

interface UserWithProofStatus extends User {
  proofOfLifeStatus?: string | null;
}

interface ViewUserModalProps {
  open: boolean;
  onClose: () => void;
  user: UserWithProofStatus | null;
  type: UserTableType;
}

export function ViewUserModal({ open, onClose, user, type }: ViewUserModalProps) {
  if (!user) return null;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Detalhes do ${type === 'admin' ? 'Administrador' : 'Usuário'}`, 14, 20);

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

      let proofStatus = 'Não Enviada';
      if (user.proofOfLifeStatus) {
        switch (user.proofOfLifeStatus) {
          case 'APPROVED':
            proofStatus = 'Aprovada';
            break;
          case 'REJECTED':
            proofStatus = 'Rejeitada';
            break;
          case 'SUBMITTED':
          case 'PENDING':
            proofStatus = 'Pendente';
            break;
        }
      }
      data.push(['Status da Prova de Vida', proofStatus]);

      if (user.benefitType === 'APOSENTADORIA') {
        data.push(['Tipo de Aposentadoria', user.retirementType || '-']);
      }

      if (user.benefitType === 'PENSAO') {
        data.push(['Nome do Segurado', user.insuredName || '-']);
      }

      data.push(['Representante Legal', user.legalRepresentative || '-']);
    }

    (doc as any).autoTable({
      startY: 30,
      body: data,
      theme: 'striped',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 100 }
      }
    });

    doc.save(`${type === 'admin' ? 'admin' : 'usuario'}_${user.name.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  const getProofOfLifeStatusDisplay = () => {
    if (!user.proofOfLifeStatus) {
      return <Badge variant="warning">Não Enviada</Badge>;
    }
    
    const statusColors = {
      PENDING: 'warning',
      SUBMITTED: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
    } as const;
    
    const statusLabels = {
      PENDING: 'Pendente',
      SUBMITTED: 'Pendente',
      APPROVED: 'Aprovada',
      REJECTED: 'Rejeitada',
    };
    
    return (
      <Badge variant={statusColors[user.proofOfLifeStatus as keyof typeof statusColors]}>
        {statusLabels[user.proofOfLifeStatus as keyof typeof statusLabels] || 'Não Enviada'}
      </Badge>
    );
  };

  return (
    <Transition appear show={open} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 flex justify-between items-center"
                >
                  <span>Detalhes do {type === 'admin' ? 'Administrador' : 'Usuário'}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-0 h-8 w-8 rounded-full" 
                    onClick={handleExportPDF}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </Dialog.Title>

                <div className="mt-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Nome</h4>
                    <p className="mt-1">{user.name}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">CPF</h4>
                    <p className="mt-1">{formatCPF(user.cpf)}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Email</h4>
                    <p className="mt-1">{user.email || '-'}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Status</h4>
                    <p className="mt-1">
                      <Badge variant={user.active ? 'success' : 'error'}>
                        {user.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </p>
                  </div>

                  {type === 'app' && (
                    <>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Status da Prova de Vida</h4>
                        <p className="mt-1">
                          {getProofOfLifeStatusDisplay()}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">RG</h4>
                        <p className="mt-1">{user.rg || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Data de Nascimento</h4>
                        <p className="mt-1">{user.birthDate ? formatDate(user.birthDate) : '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Endereço</h4>
                        <p className="mt-1">{user.address || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Telefone</h4>
                        <p className="mt-1">{user.phone ? formatPhone(user.phone) : '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Matrícula</h4>
                        <p className="mt-1">{user.registrationNumber || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Processo</h4>
                        <p className="mt-1">{user.processNumber || '-'}</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Tipo de Benefício</h4>
                        <p className="mt-1">
                          {user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Data Início do Benefício</h4>
                        <p className="mt-1">
                          {user.benefitStartDate ? formatDate(user.benefitStartDate) : '-'}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Data Fim do Benefício</h4>
                        <p className="mt-1">{user.benefitEndDate || '-'}</p>
                      </div>

                      {user.benefitType === 'APOSENTADORIA' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Tipo de Aposentadoria</h4>
                          <p className="mt-1">{user.retirementType || '-'}</p>
                        </div>
                      )}

                      {user.benefitType === 'PENSAO' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Nome do Segurado</h4>
                          <p className="mt-1">{user.insuredName || '-'}</p>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Representante Legal</h4>
                        <p className="mt-1">{user.legalRepresentative || '-'}</p>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}