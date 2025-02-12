import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { User } from '@/types/user';
import { formatDate } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useParams } from 'react-router-dom';
import { getUser } from '@/utils/auth';

interface ViewUserModalProps {
  user: User;
  open: boolean;
  onClose: () => void;
}

export function ViewUserModal({ user, open, onClose }: ViewUserModalProps) {
  const { subdomain } = useParams();
  const currentUser = getUser();
  const isSuperAdmin = currentUser?.isSuperAdmin === true;

  // Buscar dados atualizados do usuário
  const { data: updatedUser } = useQuery({
    queryKey: ['user', user.id],
    queryFn: async () => {
      const baseUrl = isSuperAdmin ? '/users' : `/users/${subdomain}/users`;
      const response = await api.get(`${baseUrl}/${user.id}`);
      return response.data;
    },
    enabled: open // Só busca quando o modal estiver aberto
  });

  // Usar os dados mais atualizados
  const userData = updatedUser || user;

  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text('Detalhes do Usuário', 14, 20);

    // Prepare data for table
    const data = [
      ['Nome', userData.name],
      ['CPF', userData.cpf],
      ['RG', userData.rg || '-'],
      ['Email', userData.email || '-'],
      ['Telefone', userData.phone || '-'],
      ['Data de Nascimento', userData.birthDate ? formatDate(userData.birthDate) : '-'],
      ['Endereço', userData.address || '-'],
      ['Matrícula', userData.registrationNumber || '-'],
      ['Processo', userData.processNumber || '-'],
      ['Data Início do Benefício', userData.benefitStartDate ? formatDate(userData.benefitStartDate) : '-'],
      ['Data Fim do Benefício', userData.benefitEndDate || '-'],
      ['Tipo de Benefício', userData.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 
                           userData.benefitType === 'PENSAO' ? 'Pensão' : '-'],
      ['Tipo de Aposentadoria', userData.retirementType || '-'],
      ['Nome do Segurado', userData.insuredName || '-'],
      ['Representante Legal', userData.legalRepresentative || '-'],
      ['Status', userData.active ? 'Ativo' : 'Inativo'],
      ['Data de Cadastro', formatDate(userData.createdAt)]
    ];

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
    doc.save(`usuario-${userData.cpf}.pdf`);
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
                      <p className="mt-1 text-sm text-gray-900">{userData.name}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">CPF</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.cpf}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">RG</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.rg || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Email</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.email || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Telefone</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.phone || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data de Nascimento</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {userData.birthDate ? formatDate(userData.birthDate) : '-'}
                      </p>
                    </div>

                    <div className="col-span-3">
                      <h4 className="text-sm font-medium text-gray-500">Endereço</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.address || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Matrícula</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.registrationNumber || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Processo</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.processNumber || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data Início do Benefício</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {userData.benefitStartDate ? formatDate(userData.benefitStartDate) : '-'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data Fim do Benefício</h4>
                      <p className="mt-1 text-sm text-gray-900">{userData.benefitEndDate || '-'}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Tipo de Benefício</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {userData.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 
                         userData.benefitType === 'PENSAO' ? 'Pensão' : '-'}
                      </p>
                    </div>

                    {userData.benefitType === 'APOSENTADORIA' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Tipo de Aposentadoria</h4>
                        <p className="mt-1 text-sm text-gray-900">{userData.retirementType || '-'}</p>
                      </div>
                    )}

                    {userData.benefitType === 'PENSAO' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Nome do Segurado</h4>
                        <p className="mt-1 text-sm text-gray-900">{userData.insuredName || '-'}</p>
                      </div>
                    )}

                    {userData.legalRepresentative && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Representante Legal</h4>
                        <p className="mt-1 text-sm text-gray-900">{userData.legalRepresentative}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Status</h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {userData.active ? 'Ativo' : 'Inativo'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Data de Cadastro</h4>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(userData.createdAt)}</p>
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