import { startOfWeek, endOfWeek, parseISO } from 'date-fns';

export function getStartOfWeek(date: string): Date {
  return startOfWeek(parseISO(date), { weekStartsOn: 1 }); 
}

export function getEndOfWeek(date: string): Date {
  return endOfWeek(parseISO(date), { weekStartsOn: 1 });
}