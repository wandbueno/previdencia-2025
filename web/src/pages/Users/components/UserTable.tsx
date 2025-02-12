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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  type
}: UserTableProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const baseColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'cpf',
      header: 'CPF',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.cpf}</span>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 180,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email || '-'}</span>
      )
    }
  ];

  // Colunas específicas para usuários do app
  const appColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'rg',
      header: 'RG',
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.rg || '-'}</span>
      )
    },
    {
      accessorKey: 'processNumber',
      header: 'Processo',
      size: 100,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.processNumber || '-'}</span>
      )
    },
    {
      accessorKey: 'registrationNumber',
      header: 'Matrícula',
      size: 90,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.registrationNumber || '-'}</span>
      )
    },
    {
      accessorKey: 'benefitType',
      header: 'Benefício',
      size: 90,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.benefitType === 'APOSENTADORIA' ? 'Apos.' : 
           row.original.benefitType === 'PENSAO' ? 'Pensão' : '-'}
        </span>
      )
    }
  ];

  // Coluna de status comum para todos os tipos
  const statusColumn: ColumnDef<User> = {
    accessorKey: 'active',
    header: 'Status',
    size: 80,
    cell: ({ getValue }) => (
      <Badge variant={getValue<boolean>() ? 'success' : 'error'}>
        {getValue<boolean>() ? 'Ativo' : 'Inativo'}
      </Badge>
    )
  };

  // Coluna de ações
  const actionsColumn: ColumnDef<User> = {
    id: 'actions',
    header: 'Ações',
    size: 90,
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
  };

  // Montar as colunas baseado no tipo
  const columns = [...baseColumns];
  if (type === 'app') {
    columns.push(...appColumns);
  }
  columns.push(statusColumn);
  if (showActions) {
    columns.push(actionsColumn);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Carregando usuários...</div>
      </div>
    );
  }

  const handleExport = async (exportType: 'csv' | 'excel' | 'pdf') => {
    const exportData = users.map(user => ({
      Nome: user.name,
      CPF: user.cpf,
      Email: user.email || '-',
      ...(type === 'app' ? {
        RG: user.rg || '-',
        'Data de Nascimento': user.birthDate ? formatDate(user.birthDate) : '-',
        Endereço: user.address || '-',
        Telefone: user.phone || '-',
        Matrícula: user.registrationNumber || '-',
        Processo: user.processNumber || '-',
        'Data Início': user.benefitStartDate ? formatDate(user.benefitStartDate) : '-',
        'Data Fim': user.benefitEndDate || '-',
        'Tipo': user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 
                user.benefitType === 'PENSAO' ? 'Pensão' : '-',
      } : {}),
      Status: user.active ? 'Ativo' : 'Inativo'
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
  
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
  
      doc.setFont('helvetica');
      doc.setFontSize(16);
      const title = 'Relatório de Usuários';
      const titleWidth = doc.getTextWidth(title);
      const titleX = (pageWidth - titleWidth) / 2;
      doc.text(title, titleX, 15);
      
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
        body: exportData.map(row => Object.values(row)),
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [2, 132, 199],
          textColor: 255,
          fontSize: 8,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        margin: { top: 30 },
        theme: 'grid'
      });
  
      doc.save('usuarios.pdf');
    }
  };

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