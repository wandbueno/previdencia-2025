// web/src/pages/Users/components/UserTable.tsx
import { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/format';
import { User, UserTableType } from '@/types/user';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Pencil, Trash } from 'lucide-react';
import { ViewUserModal } from './ViewUserModal';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  showActions?: boolean;
  type: UserTableType;
}

export function UserTable({ 
  users, 
  isLoading, 
  onEdit, 
  onDelete, 
  showActions = true,
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const columns: ColumnDef<User>[] = [
    {
      id: 'index',
      header: '#',
      cell: ({ row }) => row.index + 1,
      size: 50,
    },
    {
      accessorKey: 'name',
      header: 'Nome',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.cpf}</span>
      )
    },
    {
      accessorKey: 'rg',
      header: 'RG',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.rg || '-'}</span>
      )
    },
    {
      accessorKey: 'processNumber',
      header: 'Processo',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.processNumber || '-'}</span>
      )
    },
    {
      accessorKey: 'benefitType',
      header: 'Benefício',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
        </span>
      )
    },
    {
      accessorKey: 'benefitStartDate',
      header: 'Data Início',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.benefitStartDate ? formatDate(row.original.benefitStartDate) : '-'}
        </span>
      )
    },
    {
      accessorKey: 'benefitEndDate',
      header: 'Data Fim',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.benefitEndDate || '-'}</span>
      )
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue<boolean>() ? 'success' : 'error'}>
          {getValue<boolean>() ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    }
  ];

  if (showActions) {
    columns.push({
      id: 'actions',
      header: 'Ações',
      size: 100,
      cell: ({ row }) => (
        <div className="flex gap-0.5">
          <Button
            variant="ghost"
            className="text-gray-600 hover:text-gray-900 p-1 h-auto"
            onClick={() => setSelectedUser(row.original)}
            title="Visualizar"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            className="text-primary-600 hover:text-primary-900 p-1 h-auto"
            onClick={() => onEdit(row.original)}
            title="Editar"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-900 p-1 h-auto"
            onClick={() => onDelete(row.original)}
            title="Excluir"
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    });
  }

  const handleExport = async (exportType: 'csv' | 'excel' | 'pdf') => {
    const exportData = users.map(user => ({
      Nome: user.name,
      Email: user.email || '-',
      CPF: user.cpf,
      RG: user.rg || '-',
      'Data de Nascimento': user.birthDate ? formatDate(user.birthDate) : '-',
      Endereço: user.address || '-',
      Telefone: user.phone || '-',
      Matrícula: user.registrationNumber || '-',
      Processo: user.processNumber || '-',
      'Data Início do Benefício': user.benefitStartDate ? formatDate(user.benefitStartDate) : '-',
      'Data Fim do Benefício': user.benefitEndDate || '-',
      'Tipo de Benefício': user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
      'Tipo de Aposentadoria': user.retirementType || '-',
      'Nome do Segurado': user.insuredName || '-',
      'Representante Legal': user.legalRepresentative || '-',
      Status: user.active ? 'Ativo' : 'Inativo',
      'Data de Cadastro': formatDate(user.createdAt)
    }));

    if (exportType === 'csv' || exportType === 'excel') {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Usuários');

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
        type: exportType === 'csv' 
          ? 'text/csv;charset=utf-8'
          : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      saveAs(blob, `usuarios.${exportType}`);
    } else if (exportType === 'pdf') {
      const { default: jsPDF } = await import('jspdf');
      await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.autoTable({
        head: [Object.keys(exportData[0])],
        body: exportData.map(row => Object.values(row))
      });
      doc.save('usuarios.pdf');
    }
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <DataTable 
        columns={columns} 
        data={users} 
        onExport={handleExport}
      />

      {selectedUser && (
        <ViewUserModal
          user={selectedUser}
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
