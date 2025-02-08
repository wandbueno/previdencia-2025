import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { cn } from '@/utils/cn';

interface DataTableProps<TData> {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  onExport?: (type: 'csv' | 'excel' | 'pdf') => void;
}

export function DataTable<TData>({
  columns,
  data,
  onExport,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
  });


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Buscar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />

        {onExport && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'py-2 px-2 text-left text-xs font-semibold text-gray-900',
                    header.column.getCanSort() && 'cursor-pointer select-none'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                    <div className="flex items-center gap-2">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && (
                        <div className="flex flex-col">
                          <ChevronUp
                            className={cn(
                              'h-3 w-3 -mb-1',
                              header.column.getIsSorted() === 'asc'
                                ? 'text-primary-600'
                                : 'text-gray-400'
                            )}
                          />
                          <ChevronDown
                            className={cn(
                              'h-3 w-3',
                              header.column.getIsSorted() === 'desc'
                                ? 'text-primary-600'
                                : 'text-gray-400'
                            )}
                          />
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="whitespace-nowrap px-2 py-2 text-xs text-gray-500"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-2 py-3 bg-white border-t border-gray-200">
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => table.previousPage()}
      disabled={!table.getCanPreviousPage()}
    >
      Anterior
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => table.nextPage()}
      disabled={!table.getCanNextPage()}
    >
      Próxima
    </Button>
  </div>

  <div className="flex items-center gap-2 text-sm text-gray-700">
    <span>
      Página {table.getState().pagination.pageIndex + 1} de{' '}
      {table.getPageCount()}
    </span>
    <select
      value={table.getState().pagination.pageSize}
      onChange={(e) => {
        table.setPageSize(Number(e.target.value));
      }}
      className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm focus:border-primary-500 focus:ring-primary-500"
    >
      {[10, 20, 30, 40, 50].map((pageSize) => (
        <option key={pageSize} value={pageSize}>
          {pageSize} por página
        </option>
      ))}
    </select>
  </div>
</div>
    </div>
  );
}