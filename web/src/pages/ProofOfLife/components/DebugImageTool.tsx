import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import axios from 'axios';
import { ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

interface DebugImageProps {
  isOpen: boolean;
}

export const DebugImageTool: React.FC<DebugImageProps> = ({ isOpen }) => {
  const [imagePath, setImagePath] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<any | null>(null);
  const [toastInfo, setToastInfo] = useState<{
    show: boolean;
    title: string;
    description: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({ show: false, title: '', description: '', type: 'info' });

  // Função para mostrar toast
  const showToast = (title: string, description: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToastInfo({ show: true, title, description, type });
    setTimeout(() => {
      setToastInfo(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para obter informações do servidor
  const fetchServerInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/debug/server-info`);
      setServerInfo(response.data.serverInfo);
      setLoading(false);
    } catch (error: any) {
      console.error('Erro ao obter informações do servidor:', error);
      setLoading(false);
      setErrorInfo(error.message || 'Erro ao conectar com o servidor');
      showToast(
        'Erro',
        'Não foi possível obter informações do servidor',
        'error'
      );
    }
  };

  // Função para verificar se um arquivo existe
  const checkFileExists = async () => {
    if (!imagePath) {
      showToast(
        'Campo obrigatório',
        'Por favor, informe o caminho da imagem',
        'warning'
      );
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/debug/file-exists`, {
        params: { filePath: imagePath }
      });
      
      setLoading(false);
      
      if (response.data.exists) {
        showToast(
          'Arquivo encontrado',
          `Arquivo existe: ${response.data.resolvedPath}`,
          'success'
        );
        
        // Gerar URL para visualização
        generateImageUrl();
      } else {
        showToast(
          'Arquivo não encontrado',
          response.data.message,
          'error'
        );
      }
    } catch (error: any) {
      console.error('Erro ao verificar arquivo:', error);
      setLoading(false);
      setErrorInfo(error.message || 'Erro ao verificar arquivo');
      showToast(
        'Erro',
        'Não foi possível verificar o arquivo',
        'error'
      );
    }
  };

  // Função para gerar URL de imagem
  const generateImageUrl = () => {
    if (!imagePath) return;
    
    // Limpar caminho
    let cleanPath = imagePath;
    
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
      cleanPath = cleanPath.substring(9);
    } else if (cleanPath.startsWith('uploads/')) {
      cleanPath = cleanPath.substring(8);
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
    
    // Em produção sempre usar o endereço do backend hospedado no Fly.io
    const baseUrl = import.meta.env.PROD 
      ? 'https://previdencia-2025-plw27a.fly.dev'
      : (import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace('/api', '')
        : 'http://localhost:3000');
    
    const url = `${baseUrl}/uploads/${cleanPath}`;
    setImageUrl(url);
  };

  if (!isOpen) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg shadow-md border border-gray-200 mt-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Ferramenta de Debug de Imagens</h3>
      
      <div className="space-y-4">
        <Input 
          placeholder="Caminho da imagem (ex: organização/usuário/tipo_timestamp_nome.jpg)" 
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
        />
        
        <div className="flex space-x-2">
          <Button 
            color="primary" 
            onClick={checkFileExists}
            disabled={loading}
            className="flex items-center"
          >
            {loading ? 'Verificando...' : 'Verificar Arquivo'}
          </Button>
          
          <Button 
            color="secondary" 
            onClick={generateImageUrl}
            className="flex items-center"
          >
            Gerar URL
          </Button>
          
          <Button 
            color="info" 
            onClick={fetchServerInfo}
            disabled={loading}
            className="flex items-center"
          >
            Info do Servidor
          </Button>
        </div>
        
        {imageUrl && (
          <div className="bg-white p-4 rounded-md border border-gray-200">
            <p className="font-medium mb-2">URL da Imagem:</p>
            <p className="text-blue-600 mb-4 text-sm break-all">
              {imageUrl}
            </p>
            
            <p className="font-medium mb-2">Prévia:</p>
            <div className="border border-dashed border-gray-300 p-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl} 
                alt="Imagem de prévia"
                className="max-h-[200px] mx-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.insertAdjacentHTML(
                    'beforeend', 
                    '<div class="p-4 bg-gray-100 text-center"><p class="text-red-500">Imagem não carregada</p></div>'
                  );
                }}
              />
            </div>
          </div>
        )}
        
        {errorInfo && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md">
            <p className="font-bold">Erro:</p>
            <p>{errorInfo}</p>
          </div>
        )}
        
        {serverInfo && (
          <div className="border p-4 rounded-md bg-white mt-4">
            <p className="font-medium mb-2">Informações do Servidor:</p>
            <pre className="p-3 bg-gray-50 rounded-md text-sm overflow-x-auto">
              {JSON.stringify(serverInfo, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Toast notification */}
        {toastInfo.show && (
          <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${
            toastInfo.type === 'success' ? 'bg-green-100 text-green-800' :
            toastInfo.type === 'error' ? 'bg-red-100 text-red-800' :
            toastInfo.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center">
              {toastInfo.type === 'success' && <CheckCircleIcon className="w-5 h-5 mr-2" />}
              {toastInfo.type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 mr-2" />}
              {toastInfo.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 mr-2" />}
              {toastInfo.type === 'info' && <InformationCircleIcon className="w-5 h-5 mr-2" />}
              <div>
                <p className="font-bold">{toastInfo.title}</p>
                <p className="text-sm">{toastInfo.description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugImageTool;
