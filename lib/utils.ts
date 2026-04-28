import { type ClassValue, clsx } from "clsx";
import moment from "moment";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format = "DD MMM YYYY") {
  return moment(date).format(format);
}

export function formatTime(date: string | Date, format = "HH:mm") {
  return moment(date).format(format);
}

export function formatDateTime(
  date: string,
  dateFormat = "DD MMM YYYY",
  timeFormat = "HH:mm"
) {
  return `${formatDate(date, dateFormat)} ${formatTime(date, timeFormat)}`;
}
export function formatCurrency(value: number | string) {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}
