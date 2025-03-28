import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Organization } from '@/types/organization';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Função para gerar URLs de imagem que funcionam em ambos os ambientes
function getImageUrl(path: string | undefined | null) {
  if (!path) {
    return undefined;
  }

  // Se já for uma URL completa, retorna ela mesma
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Em produção sempre usar o endereço do backend hospedado no Fly.io
  const baseUrl = import.meta.env.PROD 
    ? 'https://previdencia-2025-plw27a.fly.dev'
    : (import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:3333');

  // Limpar caminho
  let cleanPath = path;
  
  // Remover referências a diretórios superiores (../../)
  if (cleanPath.includes('../')) {
    // Extrair apenas a parte do caminho que importa
    const parts = cleanPath.split('data/uploads/');
    if (parts.length > 1) {
      cleanPath = parts[1]; // Pegar apenas o caminho após data/uploads/
    } else {
      // Tentar outra abordagem para extrair as partes importantes do caminho
      const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
      const matches = cleanPath.match(uuidPattern);
      
      if (matches && matches.length >= 2) {
        // Pegar tudo a partir do primeiro UUID encontrado
        const startIdx = cleanPath.indexOf(matches[0]);
        if (startIdx !== -1) {
          cleanPath = cleanPath.substring(startIdx);
        }
      }
    }
  }
  
  // Remover o prefixo /uploads/ ou uploads/ se existir
  if (cleanPath.startsWith('/uploads/')) {
    cleanPath = cleanPath.substring(9); // Remove '/uploads/'
  } else if (cleanPath.startsWith('uploads/')) {
    cleanPath = cleanPath.substring(8); // Remove 'uploads/'
  }
  
  // Se ainda contiver data/uploads/, remover também
  if (cleanPath.startsWith('data/uploads/')) {
    cleanPath = cleanPath.substring(13);
  } else if (cleanPath.startsWith('/data/uploads/')) {
    cleanPath = cleanPath.substring(14);
  }
  
  // Remover qualquer barra extra no início
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.substring(1);
  }
  
  return `${baseUrl}/uploads/${cleanPath}`;
}

interface ViewOrganizationModalProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewOrganizationModal({ organization, isOpen, onClose }: ViewOrganizationModalProps) {
  if (!organization) return null;

  const formatCNPJ = (cnpj: string | null) => {
    if (!cnpj) return '-';
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatPhone = (phone: string | null) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  };

  const formatCEP = (cep: string | null) => {
    if (!cep) return '-';
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <Button
                    onClick={onClose}
                    size="sm"
                    className="h-8 w-8 p-0"
                    title="Fechar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Dialog.Title as="h3" className="text-lg font-semibold mb-4">
                    Detalhes da Organização
                  </Dialog.Title>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Logo</h3>
                        {organization.logo_url ? (
                          <div className="w-32 h-32 border rounded-lg overflow-hidden bg-white">
                            <img
                              src={getImageUrl(organization.logo_url)}
                              alt={`Logo ${organization.name}`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/placeholder-image.png';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="w-32 h-32 border rounded-lg flex items-center justify-center text-muted-foreground">
                            Sem logo
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Nome</h3>
                        <p className="text-sm">{organization.name}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Subdomínio</h3>
                        <p className="text-sm">{organization.subdomain}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">CNPJ</h3>
                        <p className="text-sm">{formatCNPJ(organization.cnpj)}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                        <Badge variant={organization.active ? 'success' : 'error'}>
                          {organization.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Endereço</h3>
                        <p className="text-sm">{organization.address || '-'}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">CEP</h3>
                        <p className="text-sm">{formatCEP(organization.cep)}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Cidade/Estado</h3>
                        <p className="text-sm">
                          {organization.city && organization.state 
                            ? `${organization.city}/${organization.state}`
                            : '-'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Telefone</h3>
                        <p className="text-sm">{formatPhone(organization.phone)}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p className="text-sm">{organization.email || '-'}</p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Serviços</h3>
                        <div className="flex gap-1 flex-wrap">
                          {(organization.services || []).map((service) => (
                            <Badge 
                              key={service} 
                              variant="default"
                              className="text-xs"
                            >
                              {service === 'PROOF_OF_LIFE' ? 'Prova de Vida' : 'Recadastramento'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
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
