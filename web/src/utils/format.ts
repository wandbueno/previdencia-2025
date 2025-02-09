// web/src/utils/format.ts
export function formatDate(date: string, includeTime = false) {
  if (!date) return '-';
  
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

  return new Date(date).toLocaleString('pt-BR', options);
}
