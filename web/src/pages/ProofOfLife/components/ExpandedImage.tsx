import { XMarkIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '@/lib/axios';

interface ProofImageProps {
  imageUrl: string;
  label: string;
}

export function ProofImage({ imageUrl, label }: ProofImageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Verificar se a imagem é acessível
  useEffect(() => {
    if (!imageUrl) return;
    
    const url = getImageUrl(imageUrl);
    console.log(`Testando acesso à imagem ${label}:`, url);
    
    // Criamos uma nova imagem para testar o carregamento
    const img = new Image();
    img.onload = () => {
      console.log(`✓ Imagem ${label} carregada com sucesso:`, url);
      setIsImageLoading(false);
      setImageError(false);
    };
    img.onerror = (e) => {
      console.error(`✗ Erro ao carregar imagem ${label}:`, url, e);
      setIsImageLoading(false);
      setImageError(true);
      
      // Tentativa de diagnóstico de CORS
      fetch(url, { method: 'HEAD' })
        .then(response => {
          console.log(`Teste de CORS para ${label}:`, {
            status: response.status,
            ok: response.ok,
            headers: {
              'content-type': response.headers.get('content-type'),
              'access-control-allow-origin': response.headers.get('access-control-allow-origin')
            }
          });
        })
        .catch(error => {
          console.error(`Erro no teste de CORS para ${label}:`, error);
        });
    };
    img.src = url;
  }, [imageUrl, label]);

  const getImageUrl = (path: string | undefined) => {
    if (!path) {
      console.log('Caminho vazio, usando placeholder');
      return 'https://previdencia-2025-plw27a.fly.dev/placeholder-image.png';
    }

    console.log('Caminho original recebido:', path);

    // Se já for uma URL completa, retorna ela mesma
    if (path.startsWith('http://') || path.startsWith('https://')) {
      console.log('URL completa detectada:', path);
      return path;
    }

    // Em produção sempre usar o endereço do backend hospedado no Fly.io
    const baseUrl = import.meta.env.PROD 
      ? 'https://previdencia-2025-plw27a.fly.dev'
      : (import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:3000');

    // Limpar caminho
    let cleanPath = path;
    
    // Remover referências a diretórios superiores (../../)
    if (cleanPath.includes('../')) {
      console.log('Detectada navegação relativa no caminho:', path);
      // Extrair apenas a parte do caminho que importa
      const parts = cleanPath.split('data/uploads/');
      if (parts.length > 1) {
        cleanPath = parts[1]; // Pegar apenas o caminho após data/uploads/
        console.log('Extraído caminho após data/uploads/:', cleanPath);
      } else {
        // Tentar outra abordagem para extrair as partes importantes do caminho
        const uuidPattern = /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi;
        const matches = cleanPath.match(uuidPattern);
        
        if (matches && matches.length >= 2) {
          // Pegar tudo a partir do primeiro UUID encontrado
          const startIdx = cleanPath.indexOf(matches[0]);
          if (startIdx !== -1) {
            cleanPath = cleanPath.substring(startIdx);
            console.log('Extraído caminho a partir do primeiro UUID:', cleanPath);
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
    
    console.log('Caminho limpo:', cleanPath);
    
    const finalUrl = `${baseUrl}/uploads/${cleanPath}`;
    console.log('URL final gerada:', finalUrl);
    
    return finalUrl;
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
          onClick={() => imageUrl && !imageError && setIsExpanded(true)}
        >
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-500">Carregando...</span>
            </div>
          )}
          
          <img
            src={logImageUrl(imageUrl, label)}
            alt={label}
            className={`w-full aspect-square rounded-lg object-cover ${!imageError ? 'hover:opacity-75 transition-opacity' : ''} ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            onLoad={() => setIsImageLoading(false)}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              console.error(`Erro ao carregar ${label}:`, {
                src: target.src,
                error: e
              });
              setIsImageLoading(false);
              setImageError(true);
              target.onerror = null;
              
              // Usar o placeholder do backend
              const baseUrl = import.meta.env.PROD 
                ? 'https://previdencia-2025-plw27a.fly.dev'
                : (import.meta.env.VITE_API_URL 
                  ? import.meta.env.VITE_API_URL.replace('/api', '')
                  : 'http://localhost:3000');
              target.src = `${baseUrl}/placeholder-image.png`;
            }}
          />
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
              <span className="text-gray-500">Imagem não disponível</span>
            </div>
          )}
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
