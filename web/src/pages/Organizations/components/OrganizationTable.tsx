import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DataTable } from '@/components/ui/DataTable';
import { type ColumnDef } from '@tanstack/react-table';
import { Edit, Eye, Trash } from 'lucide-react';
import { Organization } from '@/types/organization';

interface OrganizationTableProps {
  organizations: Organization[];
  isLoading: boolean;
  onEdit: (organization: Organization) => void;
  onDelete: (organization: Organization) => void;
  onView: (organization: Organization) => void;
}

export function OrganizationTable({ 
  organizations, 
  isLoading, 
  onEdit, 
  onDelete,
  onView
}: OrganizationTableProps) {
  // Funções auxiliares para formatação
  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const columns: ColumnDef<Organization>[] = [
    {
      id: 'index',
      header: '#',
      size: 50,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.index + 1}
        </span>
      )
    },
    {
      accessorKey: 'subdomain',
      header: 'Subdomínio',
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm">{row.original.subdomain || '-'}</span>
      )
    },
    {
      accessorKey: 'cnpj',
      header: 'CNPJ',
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm">{formatCNPJ(row.original.cnpj)}</span>
      )
    },
    {
      accessorKey: 'phone',
      header: 'Telefone',
      size: 150,
      cell: ({ row }) => (
        <span className="text-sm">{formatPhone(row.original.phone)}</span>
      )
    },
    {
      accessorKey: 'location',
      header: 'Cidade/Estado',
      size: 200,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.city && row.original.state 
            ? `${row.original.city}/${row.original.state}`
            : '-'}
        </span>
      )
    },
    {
      accessorKey: 'services',
      header: 'Serviços',
      size: 200,
      cell: ({ row }) => (
        <div className="flex gap-1 flex-wrap">
          {(row.original.services || []).map((service) => (
            <Badge 
              key={service} 
              variant="default"
              className="text-xs"
            >
              {service === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'}
            </Badge>
          ))}
        </div>
      )
    },
    {
      accessorKey: 'active',
      header: 'Status',
      size: 100,
      cell: ({ row }) => (
        <Badge 
          variant={row.original.active ? 'success' : 'error'}
          className="text-xs"
        >
          {row.original.active ? 'Ativo' : 'Inativo'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: 'Ações',
      size: 100,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            onClick={() => onView(row.original)}
            size="sm"
            className="h-8 w-8 p-0"
            title="Visualizar"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onEdit(row.original)}
            size="sm"
            className="h-8 w-8 p-0"
            title="Editar"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => onDelete(row.original)}
            size="sm"
            className="h-8 w-8 p-0"
            title="Excluir"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      columns={columns}
      data={organizations}
      loading={isLoading}
    />
  );
}
