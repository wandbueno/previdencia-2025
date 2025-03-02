import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/axios';

interface ProofImageProps {
  imageUrl: string;
  label: string;
}

export function ProofImage({ imageUrl, label }: ProofImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getImageUrl = (path: string | undefined) => {
    if (!path) return '/placeholder-image.png';
    
    // Se já for uma URL completa, retorna ela mesma
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Determinar a base URL para os arquivos estáticos
    let baseUrl;
    
    // Primeiro tenta usar a variável de ambiente
    if (import.meta.env.VITE_API_URL) {
      // Remove o '/api' do final para obter a origem do servidor
      baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');
    } 
    // Tenta obter da configuração atual do axios
    else if (api.defaults.baseURL) {
      // Remove o '/api' do final
      baseUrl = api.defaults.baseURL.replace('/api', '');
    }
    // Em produção, usar SEMPRE o endereço do backend no Fly.io
    else if (import.meta.env.PROD) {
      baseUrl = 'https://previdencia-2025-plw27a.fly.dev';
    }
    // Fallback para desenvolvimento local
    else {
      baseUrl = 'http://localhost:3000';
    }
    
    // Removemos qualquer barra extra para evitar problemas de caminho
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  // Função para debug que mostra no console as URLs geradas
  const logImageUrl = (path: string | undefined, type: string) => {
    console.log(`Caminho original ${type}:`, path);
    const url = getImageUrl(path);
    console.log(`URL gerada ${type}:`, url);
    console.log(`VITE_API_URL:`, import.meta.env.VITE_API_URL);
    console.log(`API baseURL:`, api.defaults.baseURL);
    return url;
  };

  return (
    <>
      {/* Imagem pequena */}
      <div className="flex flex-col">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">{label}</h4>
        <div 
          className="cursor-pointer relative"
          onClick={() => imageUrl && setIsExpanded(true)}
        >
          <img
            src={logImageUrl(imageUrl, label)}
            alt={label}
            className="w-full aspect-square rounded-lg object-cover hover:opacity-75 transition-opacity"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`Erro ao carregar ${label}:`, {
                src: target.src,
                error: e
              });
              target.onerror = null;
              target.src = '/placeholder-image.png';
            }}
          />
        </div>
      </div>

      {/* Portal para o overlay da imagem expandida */}
      {isExpanded &&
        createPortal(
          <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={(e) => {
              // Fecha ao clicar no overlay
              if (e.target === e.currentTarget) {
                setIsExpanded(false);
              }
            }}
          >
            <div className="relative" onClick={e => e.stopPropagation()}>
              <button
                type="button"
                className="absolute -top-2 -right-2 rounded-full bg-white p-1.5 text-gray-900 shadow-lg hover:text-gray-600 focus:outline-none"
                onClick={() => setIsExpanded(false)}
                style={{ zIndex: 10000 }}
              >
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
              <img
                src={logImageUrl(imageUrl, `${label} (expandida)`)}
                alt={label}
                className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  console.error(`Erro ao carregar ${label} expandida:`, {
                    src: target.src,
                    error: e
                  });
                  target.onerror = null;
                  target.src = '/placeholder-image.png';
                }}
              />
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
}
