// web/src/utils/format.ts
export function formatDate(date: string | undefined, includeTime = false) {
  if (!date) return '-';
  if (date === 'VITALICIO') return 'Vitalício';
  
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return '-';

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(includeTime && {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };

    return parsedDate.toLocaleString('pt-BR', options);
  } catch {
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
