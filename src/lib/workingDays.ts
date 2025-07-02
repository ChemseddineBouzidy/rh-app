export function getWorkingDays(startDate: Date, endDate: Date): number {
  let count = 0;
  const date = new Date(startDate);

  while (date < endDate) {
    const day = date.getDay();
    if (day !== 0 && day !== 6) count++; // Lundi à vendredi
    date.setDate(date.getDate() + 1);
  }

  return count;
}

export function getWorkingDaysInMonth(year: number, month: number): number {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0); // Dernier jour du mois
  return getWorkingDays(startDate, endDate);
}

export function getWorkingDaysBetweenMonths(startDate: Date, endDate: Date): number {
  let totalDays = 0;
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  
  while (current <= endDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    
    const periodStart = current.getTime() === monthStart.getTime() ? startDate : monthStart;
    const periodEnd = endDate < monthEnd ? endDate : monthEnd;
    
    totalDays += getWorkingDays(periodStart, periodEnd);
    
    current.setMonth(current.getMonth() + 1);
  }
  
  return totalDays;
}
