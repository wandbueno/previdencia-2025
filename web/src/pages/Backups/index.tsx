import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/Button';
import { 
  ArrowPathIcon,
  ServerIcon 
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { getAuthToken } from '@/utils/auth';

export function BackupsPage() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  // Função para criar backup
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/backups');
      console.log('🔍 Resposta da API de backup:', response.data);
      return response.data;
    },
    onSuccess: (data) => {
      console.log('🔍 Resposta da API de backup:', data);
      console.log('✅ Backup criado com sucesso, dados recebidos:', data);
      toast.success('Backup criado com sucesso!');

      // Baixar o arquivo ZIP diretamente usando AJAX
      if (data.downloadUrl) {
        console.log('📥 URL de download do backup:', data.downloadUrl);
        downloadFileWithAuth(data.downloadUrl);
      } else if (data.filename) {
        // Fallback caso a URL de download não esteja disponível
        // Obter a origem da página atual
        const origin = window.location.origin;
        const downloadUrl = `${origin}/backups-files/${data.filename}`;
        console.log('📥 URL alternativa de download do backup:', downloadUrl);
        downloadFileWithAuth(downloadUrl);
      } else {
        console.error('❌ Nome do arquivo de backup não encontrado na resposta', data);
        toast.error('Erro ao baixar o backup: nome do arquivo não encontrado');
      }
      
      setIsCreatingBackup(false);
    },
    onError: (error) => {
      console.error('❌ Erro ao criar backup:', error);
      toast.error('Erro ao criar backup. Tente novamente mais tarde.');
      setIsCreatingBackup(false);
    }
  });

  // Função para baixar arquivo com autenticação
  const downloadFileWithAuth = (url: string) => {
    console.log('🔄 Iniciando download autenticado do arquivo:', url);
    
    const token = getAuthToken();
    if (!token) {
      console.error('❌ Token de autenticação não encontrado');
      toast.error('Erro de autenticação. Faça login novamente.');
      return;
    }
    
    console.log('🔑 Token de autenticação encontrado');
    
    // Criar elemento âncora temporário
    const link = document.createElement('a');
    link.style.display = 'none';
    document.body.appendChild(link);
    
    console.log('📡 Fazendo requisição fetch com autenticação');
    const toastId = toast.loading('Preparando download...');
    
    // Configurar fetch com autenticação
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      console.log('📥 Resposta recebida:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      return response.blob();
    })
    .then(blob => {
      console.log('📦 Blob recebido, tamanho:', Math.round(blob.size / 1024), 'KB');
      toast.dismiss(toastId);
      toast.success('Download iniciado!');
      
      // Criar URL temporária para o blob
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Extrair nome do arquivo da URL
      const filename = url.split('/').pop() || 'backup.zip';
      
      console.log('📎 Configurando download para arquivo:', filename);
      
      // Configurar e clicar no link para download
      link.href = blobUrl;
      link.download = filename;
      
      console.log('🖱️ Simulando clique para iniciar download');
      link.click();
      
      // Limpar
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
        console.log('🧹 Recursos de download liberados');
      }, 100);
      
      toast.success('Download iniciado com sucesso!');
    })
    .catch(error => {
      toast.dismiss(toastId);
      console.error('❌ Erro ao baixar arquivo:', error);
      toast.error(`Erro ao baixar o backup: ${error.message}`);
    });
  };

  // Função para iniciar a criação de backup
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    createBackupMutation.mutate();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backup do Sistema</h1>
          <p className="text-muted-foreground">
            Realize backup do banco de dados principal e das organizações
          </p>
        </div>
        <Button 
          className="flex items-center gap-2" 
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
        >
          {isCreatingBackup ? (
            <ArrowPathIcon className="h-5 w-5 animate-spin" />
          ) : (
            <ServerIcon className="h-5 w-5" />
          )}
          {isCreatingBackup ? 'Criando backup...' : 'Criar e baixar backup'}
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-yellow-50 border-yellow-200">
        <h3 className="font-medium text-yellow-800">Informações sobre backup</h3>
        <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
          <li>O backup inclui o banco de dados principal e todos os bancos de dados das organizações</li>
          <li>Os arquivos são compactados em um único arquivo ZIP para download</li>
          <li>Este processo pode levar alguns segundos dependendo do tamanho dos bancos de dados</li>
          <li>Recomendamos realizar backups periódicos para garantir a segurança dos dados</li>
        </ul>
      </div>
    </div>
  );
}
