import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { User, UserTableType } from '@/types/user';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Download, FileSpreadsheet, FileText, Pencil, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onView: (user: User) => void;
  type: UserTableType;
}

export function UserTable({ users, isLoading, onEdit, onDelete, onView, type }: UserTableProps) {

  const handleExportPDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Add title
    doc.setFontSize(16);
    doc.text(`Lista de ${type === 'admin' ? 'Administradores' : 'Usuários'}`, 14, 20);

    // Prepare data for table
    const data = users.map((user, index) => [
      index + 1,
      user.name,
      user.cpf,
      user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
      [
        user.canProofOfLife ? 'Prova de Vida' : '',
        user.canRecadastration ? 'Recadastramento' : ''
      ].filter(Boolean).join(', '),
      user.active ? 'Ativo' : 'Inativo'
    ]);

    // Add table
    (doc as any).autoTable({
      startY: 30,
      head: [['#', 'Nome', 'CPF', 'Benefício', 'Serviços', 'Status']],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 10 },  // #
        1: { cellWidth: 60 },  // Nome
        2: { cellWidth: 30 },  // CPF
        3: { cellWidth: 30 },  // Benefício
        4: { cellWidth: 50 },  // Serviços
        5: { cellWidth: 20 }   // Status
      }
    });

    // Save PDF
    doc.save(`usuarios-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuários');

    // Define columns
    const columns = [
      { header: '#', key: 'index', width: 10 },
      { header: 'Nome', key: 'name', width: 30 },
      { header: 'CPF', key: 'cpf', width: 20 },
      { header: 'Benefício', key: 'benefitType', width: 20 },
      { header: 'Serviços', key: 'services', width: 30 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    worksheet.columns = columns;

    // Add rows
    const rows = users.map((user, index) => ({
      index: index + 1,
      name: user.name,
      cpf: user.cpf,
      benefitType: user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
      services: [
        user.canProofOfLife ? 'Prova de Vida' : '',
        user.canRecadastration ? 'Recadastramento' : ''
      ].filter(Boolean).join(', '),
      status: user.active ? 'Ativo' : 'Inativo'
    }));

    worksheet.addRows(rows);

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0284C7' }
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true };

    // Generate buffer and save
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `usuarios-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    // Prepare headers
    const headers = ['#', 'Nome', 'CPF', 'Benefício', 'Serviços', 'Status'];

    // Prepare rows
    const rows = users.map((user, index) => [
      index + 1,
      user.name,
      user.cpf,
      user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
      [
        user.canProofOfLife ? 'Prova de Vida' : '',
        user.canRecadastration ? 'Recadastramento' : ''
      ].filter(Boolean).join(', '),
      user.active ? 'Ativo' : 'Inativo'
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `usuarios-${type}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const columns: ColumnDef<User>[] = [
    {
      id: 'index',
      header: '#',
      size: 60,
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">{row.index + 1}</span>
      )
    },
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
    ...(type === 'app' ? [
      {
        accessorKey: 'benefitType',
        header: 'Benefício',
        size: 120,
        cell: ({ row }) => (
          <span className="text-sm">
            {row.original.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
          </span>
        )
      } as ColumnDef<User>
    ] : []),
    {
      header: 'Serviços',
      size: 200,
      cell: ({ row }) => (
        <div className="space-x-2">
          {row.original.canProofOfLife && (
            <Badge variant="success">Prova de Vida</Badge>
          )}
          {row.original.canRecadastration && (
            <Badge variant="success">Recadastramento</Badge>
          )}
        </div>
      )
    },
    {
      accessorKey: 'active',
      header: 'Status',
      size: 100,
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'success' : 'error'}>
          {row.original.active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Ações',
      size: 120,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(row.original)}
            title="Visualizar detalhes"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row.original)}
            title="Editar"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row.original)}
            title="Excluir"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  const exportActions = [
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Exportar PDF',
      onClick: handleExportPDF
    },
    {
      icon: <FileSpreadsheet className="h-4 w-4" />,
      label: 'Exportar XLSX',
      onClick: handleExportXLSX
    },
    {
      icon: <Download className="h-4 w-4" />,
      label: 'Exportar CSV',
      onClick: handleExportCSV
    }
  ];

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-end gap-2 mb-4">
        {exportActions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={action.onClick}
          >
            {action.icon}
            {action.label}
          </Button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
      />
    </div>
  );
}