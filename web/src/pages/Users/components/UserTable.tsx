import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { formatDate } from '@/utils/format';
import { User, UserTableType } from '@/types/user';
import { type ColumnDef } from '@tanstack/react-table';
import { Eye, Download, FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  type: UserTableType;
}

export function UserTable({ users, isLoading, onView, type }: UserTableProps) {
  // Colunas para usuários administradores
  const adminColumns: ColumnDef<User>[] = [
    {
      accessorKey: 'name',
      header: 'Nome',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.name}</span>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.email}</span>
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
      header: 'Ação',
      size: 80,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

  // Colunas para usuários do app
  const appColumns: ColumnDef<User>[] = [
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
    {
      accessorKey: 'benefitType',
      header: 'Benefício',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'}
        </span>
      )
    },
    {
      accessorKey: 'benefitStartDate',
      header: 'Data Início',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.benefitStartDate)}
        </span>
      )
    },
    {
      accessorKey: 'benefitEndDate',
      header: 'Data Fim',
      size: 120,
      cell: ({ row }) => (
        <span className="text-sm">
          {formatDate(row.original.benefitEndDate)}
        </span>
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
      header: 'Ação',
      size: 80,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(row.original)}
        >
          <Eye className="h-4 w-4" />
        </Button>
      )
    }
  ];

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
    const data = users.map(user => {
      if (type === 'admin') {
        return [
          user.name,
          user.email,
          user.cpf,
          user.active ? 'Ativo' : 'Inativo'
        ];
      }
      return [
        user.name,
        user.cpf,
        user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
        formatDate(user.benefitStartDate),
        formatDate(user.benefitEndDate),
        user.active ? 'Ativo' : 'Inativo'
      ];
    });

    // Add table
    (doc as any).autoTable({
      startY: 30,
      head: [type === 'admin' 
        ? ['Nome', 'Email', 'CPF', 'Status']
        : ['Nome', 'CPF', 'Benefício', 'Data Início', 'Data Fim', 'Status']
      ],
      body: data,
      theme: 'striped',
      headStyles: { fillColor: [2, 132, 199] },
      styles: { fontSize: 10 },
      columnStyles: type === 'admin' 
        ? {
            0: { cellWidth: 80 }, // Nome
            1: { cellWidth: 80 }, // Email
            2: { cellWidth: 40 }, // CPF
            3: { cellWidth: 30 }  // Status
          }
        : {
            0: { cellWidth: 80 }, // Nome
            1: { cellWidth: 40 }, // CPF
            2: { cellWidth: 40 }, // Benefício
            3: { cellWidth: 35 }, // Data Início
            4: { cellWidth: 35 }, // Data Fim
            5: { cellWidth: 30 }  // Status
          }
    });

    // Save PDF
    doc.save(`usuarios-${type}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportXLSX = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuários');

    // Define columns
    const columns = type === 'admin' 
      ? [
          { header: 'Nome', key: 'name' },
          { header: 'Email', key: 'email' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Status', key: 'status' }
        ]
      : [
          { header: 'Nome', key: 'name' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Benefício', key: 'benefitType' },
          { header: 'Data Início', key: 'benefitStartDate' },
          { header: 'Data Fim', key: 'benefitEndDate' },
          { header: 'Status', key: 'status' }
        ];

    worksheet.columns = columns;

    // Add rows
    const rows = users.map(user => {
      if (type === 'admin') {
        return {
          name: user.name,
          email: user.email || '-',
          cpf: user.cpf,
          status: user.active ? 'Ativo' : 'Inativo'
        };
      }
      return {
        name: user.name,
        cpf: user.cpf,
        benefitType: user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
        benefitStartDate: formatDate(user.benefitStartDate),
        benefitEndDate: formatDate(user.benefitEndDate),
        status: user.active ? 'Ativo' : 'Inativo'
      };
    });

    worksheet.addRows(rows);

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '0284C7' } // primary-600 color
    };
    worksheet.getRow(1).font = { color: { argb: 'FFFFFF' }, bold: true };

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Save file using file-saver
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `usuarios-${type}-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportCSV = () => {
    // Create CSV content
    const headers = type === 'admin' 
      ? ['Nome', 'Email', 'CPF', 'Status']
      : ['Nome', 'CPF', 'Benefício', 'Data Início', 'Data Fim', 'Status'];

    const csvContent = [
      headers.join(','),
      ...users.map(user => {
        if (type === 'admin') {
          return [
            user.name,
            user.email,
            user.cpf,
            user.active ? 'Ativo' : 'Inativo'
          ].join(',');
        }
        return [
          user.name,
          user.cpf,
          user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão',
          formatDate(user.benefitStartDate),
          formatDate(user.benefitEndDate),
          user.active ? 'Ativo' : 'Inativo'
        ].join(',');
      })
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `usuarios-${type}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const columns = type === 'admin' ? adminColumns : appColumns;

  return (
    <div className="space-y-4">
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportPDF}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          PDF
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportXLSX}
          className="flex items-center gap-2"
        >
          <FileSpreadsheet className="h-4 w-4" />
          XLSX
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          CSV
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
      />
    </div>
  );
}