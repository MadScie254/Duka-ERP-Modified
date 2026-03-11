import { format } from 'date-fns';

export const formatKES = (amount?: number | null) => {
  if (amount === undefined || amount === null) return 'KES 0';
  return `KES ${amount.toLocaleString('en-KE', { maximumFractionDigits: 0 })}`;
};

export const formatDate = (value?: string | Date | null) => {
  if (!value) return '';
  return format(new Date(value), 'dd MMM yyyy');
};

export const normalizeKenyanPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('254')) return `0${digits.slice(3)}`;
  if (digits.startsWith('7') && digits.length === 9) return `0${digits}`;
  if (digits.startsWith('1') && digits.length === 9) return `0${digits}`;
  if (digits.startsWith('0') && (digits[1] === '7' || digits[1] === '1')) return digits;
  return raw;
};

export const isValidMpesaCode = (code: string) => /^[A-Z0-9]{10}$/.test(code);
