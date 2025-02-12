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
    <div className="flex flex-col h-full">
      {/* Cabeçalho com busca e exportação */}
      <div className="flex items-center justify-between mb-4 flex-none">
        <Input
          placeholder="Buscar..."
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-xs"
        />

        {onExport && (
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('csv')}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('excel')}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onExport('pdf')}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              PDF
            </Button>
          </div>
        )}
      </div>

      {/* Container da tabela com scroll */}
      <div className="flex-1 min-h-0 border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-auto h-full">
          <style>
            {`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
                height: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: #F3F4F6;
                border-radius: 3px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #D1D5DB;
                border-radius: 3px;
                border: 1px solid #F3F4F6;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #9CA3AF;
              }
              .custom-scrollbar::-webkit-scrollbar-corner {
                background: #F3F4F6;
              }
            `}
          </style>
          <div className="custom-scrollbar min-w-full inline-block align-middle h-full">
            <table className="min-w-full table-fixed divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={cn(
                          'py-2 px-2 text-left text-xs font-semibold text-gray-900 sticky top-0 bg-gray-50 z-10',
                          header.column.getCanSort() && 'cursor-pointer select-none hover:bg-gray-100'
                        )}
                        style={{ 
                          minWidth: header.column.columnDef.size,
                          width: header.column.columnDef.size 
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <div className="flex flex-col">
                              <ChevronUp
                                className={cn(
                                  'h-3 w-3 -mb-0.5 transition-colors',
                                  header.column.getIsSorted() === 'asc'
                                    ? 'text-primary-600'
                                    : 'text-gray-400'
                                )}
                              />
                              <ChevronDown
                                className={cn(
                                  'h-3 w-3 transition-colors',
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
              <tbody className="divide-y divide-gray-200 bg-white">
                {table.getRowModel().rows.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap py-2 px-2 text-xs text-gray-500"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Paginação */}
      <div className="flex items-center justify-between px-3 py-2 mt-4 bg-white border border-gray-200 rounded-lg shadow-sm flex-none">
        <div className="flex items-center gap-1">
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

        <div className="flex items-center gap-2 text-xs text-gray-700">
          <span>
            Página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
            className="rounded-md border border-gray-300 py-1 pl-2 pr-8 text-xs focus:border-primary-500 focus:ring-primary-500 bg-white hover:bg-gray-50 transition-colors"
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