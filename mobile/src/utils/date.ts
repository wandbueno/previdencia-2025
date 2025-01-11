import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(dateString: string | undefined) {
  try {
    if (!dateString) {
      return 'Data inválida';
    }

    // Remove any time component and ensure YYYY-MM-DD format
    const dateOnly = dateString.split('T')[0];
    const date = parseISO(dateOnly);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Data inválida';
    }

    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Data inválida';
  }
}

export function formatDateTime(dateString: string | undefined) {
  try {
    if (!dateString) {
      return 'Data inválida';
    }

    const date = parseISO(dateString);

    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Data inválida';
    }

    return format(date, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    return 'Data inválida';
  }
}

export function calculateDaysRemaining(endDate: string | undefined) {
  try {
    if (!endDate) return 0;

    // Remove any time component and ensure YYYY-MM-DD format
    const dateOnly = endDate.split('T')[0];
    const end = parseISO(`${dateOnly}T23:59:59`);
    
    if (isNaN(end.getTime())) {
      console.error('Invalid end date:', endDate);
      return 0;
    }

    const now = new Date();
    const days = differenceInDays(end, now);
    
    return Math.max(0, days);
  } catch (error) {
    console.error('Error calculating days remaining:', endDate, error);
    return 0;
  }
}