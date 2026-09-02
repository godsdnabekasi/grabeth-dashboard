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

export const formatTimeString = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hoursInt = parseInt(hours);
  const minutesInt = parseInt(minutes);
  const hours24 = hoursInt % 24;
  const minutes24 = minutesInt < 10 ? `0${minutesInt}` : minutesInt;
  return `${String(hours24).padStart(2, "0")}:${minutes24}`;
};

export function formatDateTime(
  date: string,
  dateFormat = "DD MMM YYYY",
  timeFormat = "HH:mm"
) {
  return `${formatDate(date, dateFormat)} ${formatTime(date, timeFormat)}`;
}

export function formatDateAgo(date: string | Date) {
  return moment(date).fromNow();
}

export function formatDateTimeISO(date: string) {
  return moment(date).toISOString();
}

export function changeTimeZone(date: Date | string, offset: number = 7) {
  return moment(date).utcOffset(offset).toISOString(true);
}

export function formatCurrency(value: number | string) {
  if (!value && value !== 0) return "";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
