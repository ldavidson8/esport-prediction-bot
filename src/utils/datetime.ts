import { format } from "date-fns";

export function yearMonthDay(date: Date): string {
  return format(date, "yyyy");
}
export function yearMonth(date: Date): string {
  return format(date, "yyyy-MM");
}
export function yearMonthDayHour(date: Date): string {
  return format(date, "yyyy-MM-dd HH");
}
export function yearMonthDayHourMinute(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm");
}
export function yearMonthDayHourMinuteSecond(date: Date): string {
  return format(date, "yyyy-MM-dd HH:mm:ss");
}
