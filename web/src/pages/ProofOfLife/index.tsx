// web/src/pages/ProofOfLife/index.tsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { getUser } from '@/utils/auth';
import { ReviewProofOfLifeModal } from './components/ReviewProofOfLifeModal';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@/utils/format';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProofOfLife {
  id: string;
  user: {
    id: string;
    name: string;
    cpf: string;
    rg: string;
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
}

export function ProofOfLifePage() {
  const [selectedProof, setSelectedProof] = useState<ProofOfLife | null>(null);
  const user = getUser();

  // Corrigido a desestruturação do useQuery para incluir isPending
  const { data: proofs, isPending } = useQuery<ProofOfLife[]>({
    queryKey: ['proof-of-life'],
    queryFn: async () => {
      const response = await api.get('/proof-of-life/admin');
      return response.data;
    },
  });

  const statusColors = {
    PENDING: 'warning',
    SUBMITTED: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
  } as const;

  const statusLabels = {
    PENDING: 'Pendente',
    SUBMITTED: 'Pendente',
    APPROVED: 'Aprovado',
    REJECTED: 'Rejeitado',
  };

  const columns: ColumnDef<ProofOfLife>[] = [
    {
      accessorFn: (row) => row.user.name,
      header: 'Nome'
    },
    {
      accessorFn: (row) => row.user.cpf,
      header: 'CPF'
    },
    {
      accessorFn: (row) => row.user.rg,
      header: 'RG'
    },
    {
      accessorFn: (row) => row.event.title,
      header: 'Evento'
    },
    {
      accessorKey: 'createdAt',
      header: 'Data/Hora do Envio',
      cell: ({ getValue }) => formatDate(getValue<string>(), true)
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue<ProofOfLife['status']>();
        return (
          <Badge variant={statusColors[status]}>
            {statusLabels[status]}
          </Badge>
        );
      }
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => setSelectedProof(row.original)}
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  const handleExport = async (type: 'csv' | 'excel' | 'pdf') => {
    if (!proofs) return;

    const exportData = proofs.map(proof => ({
      Nome: proof.user.name,
      CPF: proof.user.cpf,
      RG: proof.user.rg,
      Evento: proof.event.title,
      'Data/Hora do Envio': formatDate(proof.createdAt, true),
      Status: statusLabels[proof.status],
      'Data da Revisão': proof.reviewedAt ? formatDate(proof.reviewedAt, true) : '-',
      Observações: proof.comments || '-'
    }));

    if (type === 'csv' || type === 'excel') {
      const { Workbook } = await import('exceljs');
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Provas de Vida Realizadas');

      // Add headers
      const headers = Object.keys(exportData[0]);
      worksheet.addRow(headers);

      // Add data
      exportData.forEach(row => {
        worksheet.addRow(Object.values(row));
      });

      // Generate buffer
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: type === 'csv' 
          ? 'text/csv;charset=utf-8'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const { saveAs } = await import('file-saver');
      saveAs(blob, `provas-de-vida.${type}`);
    } else if (type === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable'); 

      const doc = new jsPDF({
        orientation: 'landscape', // Aqui definimos o modo paisagem
        unit: 'mm',
        format: 'a4'
      });
      
      // Configurações da página
            const pageWidth = doc.internal.pageSize.getWidth();
        
             // Título centralizado
            doc.setFont('helvetica');
            doc.setFontSize(16);
            const title = 'Provas de vida Realizadas';
            const titleWidth = doc.getTextWidth(title);
            const titleX = (pageWidth - titleWidth) / 2;
            doc.text(title, titleX, 15);
            
            // Data e hora centralizada
            doc.setFontSize(10);
            const currentDateTime = format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss", {
              locale: ptBR
            });
            const dateText = `Gerado em: ${currentDateTime}`;
            const dateWidth = doc.getTextWidth(dateText);
            const dateX = (pageWidth - dateWidth) / 2;
            doc.text(dateText, dateX, 22);

      doc.autoTable({
        startY: 30,
        head: [Object.keys(exportData[0])],
        body: exportData.map(row => Object.values(row))
      });
      doc.save('provas-de-vida.pdf');
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Prova de Vida</h1>
          <p className="mt-2 text-sm text-gray-700">
            {user?.role === 'ADMIN'
              ? 'Lista de todas as provas de vida enviadas.'
              : 'Histórico de provas de vida.'}
          </p>
        </div>
      </div>

      <div className="mt-8">
        {isPending ? (
          <div className="text-center py-4">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : (
          <DataTable 
            columns={columns} 
            data={proofs || []} 
            onExport={handleExport}
          />
        )}
      </div>

      {selectedProof && (
        <ReviewProofOfLifeModal
          proof={selectedProof}
          open={!!selectedProof}
          onClose={() => setSelectedProof(null)}
        />
      )}
    </div>
  );
}
