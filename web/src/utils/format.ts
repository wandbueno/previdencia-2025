// web/src/utils/format.ts
export function formatDate(date: string | undefined, includeTime = false) {
  if (!date) return '-';
  if (date === 'VITALICIO') return 'Vitalício';
  
  try {
    // Adicionar timezone de Brasília à data
    const dateString = date.includes('Z') ? date : `${date}T00:00:00-03:00`;
    const dateObj = new Date(dateString);
    
    if (isNaN(dateObj.getTime())) {
      console.error('Data inválida:', date);
      return '-';
    }

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      })
    };

    return dateObj.toLocaleString('pt-BR', options);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '-';
  }
}

export function formatCNPJ(cnpj: string) {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatCEP(cep: string) {
  return cep.replace(/^(\d{5})(\d{3})$/, '$1-$2');
}

export function formatPhone(phone: string) {
  if (phone.length === 11) {
    return phone.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  }
  return phone.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
}

export function formatCPF(cpf: string) {
  if (!cpf) return '';
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Função para ajustar data para timezone de Brasília
export function adjustDateToBrasilia(dateStr: string | undefined): string {
  if (!dateStr) return '';
  
  try {
    // Adicionar timezone de Brasília à data
    const dateString = dateStr.includes('Z') ? dateStr : `${dateStr}T00:00:00-03:00`;
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateStr);
      return '';
    }

    // Formatar como YYYY-MM-DD para campos input type="date"
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Erro ao ajustar data:', error);
    return '';
  }
}