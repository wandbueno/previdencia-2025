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
