import { format, isToday, isTomorrow, isThisWeek, differenceInHours } from 'date-fns';

export function formatEventDate(date: Date, language: 'en' | 'he'): string {
  if (isToday(date)) {
    return language === 'he' ? 'היום' : 'Today';
  }
  if (isTomorrow(date)) {
    return language === 'he' ? 'מחר' : 'Tomorrow';
  }
  if (isThisWeek(date)) {
    const dayNames = {
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      he: ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'],
    };
    return dayNames[language][date.getDay()];
  }
  return format(date, 'MMM d');
}

export function formatTime(date: Date): string {
  return format(date, 'h:mm a');
}

export function formatRelativeTime(date: Date, language: 'en' | 'he'): string {
  const hours = differenceInHours(new Date(), date);

  if (hours < 1) {
    return language === 'he' ? 'לפני כמה דקות' : 'a few minutes ago';
  }
  if (hours < 24) {
    return language === 'he' ? `לפני ${hours} שעות` : `${hours}h ago`;
  }
  if (hours < 48) {
    return language === 'he' ? 'אתמול' : 'yesterday';
  }
  return format(date, 'MMM d');
}

export function formatFullDate(date: Date, hebrewDate?: string): string {
  const gregorian = format(date, 'EEEE, MMMM d, yyyy');
  if (hebrewDate) {
    return `${gregorian} | ${hebrewDate}`;
  }
  return gregorian;
}
