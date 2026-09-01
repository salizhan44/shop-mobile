import type { OrderPublic } from "./api";

export function orderStatusLabel(status: OrderPublic["status"]): string {
  switch (status) {
    case "PENDING":
      return "Ожидает подтверждения";
    case "CONFIRMED":
      return "Подтверждён";
    case "REJECTED":
      return "Отклонён";
  }
}

export function formatOrderDate(iso: string): string {
  return new Date(iso).toLocaleString("ru-RU");
}

export function formatPriceSom(priceCents: number): string {
  return (priceCents / 100).toFixed(2);
}

export function formatPriceSomLabel(priceCents: number): string {
  return `${formatPriceSom(priceCents)} сом`;
}
