import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import LogoPublixel from '../../assets/PUBLIXEL2025min.png';
import { Organization } from '@/types/organization';
import { toast } from 'react-hot-toast';
import { useState } from 'react';

export function SelectOrganizationPage() {
  const navigate = useNavigate();
  const [selectedSubdomain, setSelectedSubdomain] = useState('');

  const { data: organizations, isLoading, error } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      try {
        const response = await api.get('/organizations/public');
        return response.data;
      } catch (error) {
        toast.error('Erro ao carregar organizações');
        return [];
      }
    },
  });

  function handleAccessOrganization() {
    if (!selectedSubdomain) {
      toast.error('Selecione uma organização');
      return;
    }
    navigate(`/${selectedSubdomain}/login`);
  }

  function handleAdminAccess() {
    navigate('/admin/login');
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-6">
          <img
            className="h-14 w-auto mx-auto"
            src={LogoPublixel}
            alt="Prova de Vida & Recadastramento"
          />
        </div>

        <div className="bg-white shadow-lg rounded-lg p-5 transform transition-all duration-200 hover:shadow-xl">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
              Erro ao carregar organizações
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Selecione sua Organização
              </label>
              <div className="relative">
                <select
                  className="appearance-none block w-full px-4 py-3 text-slate-700 bg-white
                    border border-slate-300 rounded-lg
                    hover:border-blue-500
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                    transition-colors duration-200"
                  value={selectedSubdomain}
                  onChange={(e) => setSelectedSubdomain(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Selecione uma organização...</option>
                  {organizations?.map((org) => (
                    <option key={org.id} value={org.subdomain}>
                      {org.name} - {org.city}/{org.state}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                  <svg className="h-5 w-5" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </div>
              </div>
            </div>

            <Button
              onClick={handleAccessOrganization}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5"
              disabled={isLoading || !selectedSubdomain}
            >
              Acessar Organização
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-500">
                  Acesso administrativo
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleAdminAccess}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5"
            >
              Área Administrativa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}