import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./session";

export type CustomerPublic = {
  id: string;
  email: string;
  name: string;
};

export type CustomerAuthSuccess = {
  accessToken: string;
  refreshToken: string;
  customer: CustomerPublic;
};

export type ProductPublic = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
};

export type ApiErrorBody = {
  error: string;
};

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (Platform.OS === "web") {
    return fromEnv && fromEnv.length > 0 ? fromEnv : "http://localhost:3000";
  }
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host && host !== "localhost" && host !== "127.0.0.1") {
    return `http://${host}:3000`;
  }
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return "http://localhost:3000";
}

const API_URL = resolveApiUrl();

async function parseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<CustomerAuthSuccess> {
  const response = await fetch(`${API_URL}/api/auth/customer/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as ApiErrorBody).error)
        : "Не удалось зарегистрироваться";
    throw new Error(message);
  }
  return data as CustomerAuthSuccess;
}

export async function loginCustomer(input: {
  email: string;
  password: string;
}): Promise<CustomerAuthSuccess> {
  const response = await fetch(`${API_URL}/api/auth/customer/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as ApiErrorBody).error)
        : "Не удалось войти";
    throw new Error(message);
  }
  return data as CustomerAuthSuccess;
}

export async function fetchProducts(): Promise<ProductPublic[]> {
  const response = await fetch(`${API_URL}/api/products`);
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error("Не удалось загрузить каталог");
  }
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as { products?: unknown }).products)
  ) {
    return [];
  }
  return (data as { products: ProductPublic[] }).products;
}

export type CartLinePublic = {
  id: string;
  productId: string;
  name: string;
  description: string;
  priceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type CartPublic = {
  items: CartLinePublic[];
  totalCents: number;
};

function isCartPublic(value: unknown): value is CartPublic {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as { items?: unknown; totalCents?: unknown };
  return Array.isArray(body.items) && typeof body.totalCents === "number";
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    return String((data as ApiErrorBody).error);
  }
  return fallback;
}

async function refreshSession(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) {
    return false;
  }
  const response = await fetch(`${API_URL}/api/auth/customer/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    return false;
  }
  await saveSession(data as CustomerAuthSuccess);
  return true;
}

async function authorizedFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const withToken = async (token: string) => {
    const headers = new Headers(init?.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init?.body && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    return fetch(`${API_URL}${path}`, { ...init, headers });
  };

  const token = await getAccessToken();
  if (!token) {
    throw new Error("Нужно войти");
  }
  let response = await withToken(token);
  if (response.status === 401) {
    const ok = await refreshSession();
    const next = await getAccessToken();
    if (!ok || !next) {
      throw new Error("Сессия истекла, войдите снова");
    }
    response = await withToken(next);
  }
  return response;
}

async function readCart(response: Response): Promise<CartPublic> {
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось обновить корзину"));
  }
  if (!isCartPublic(data)) {
    throw new Error("Некорректный ответ корзины");
  }
  return data;
}

export async function fetchCart(): Promise<CartPublic> {
  return readCart(await authorizedFetch("/api/cart"));
}

export async function addProductToCart(productId: string): Promise<CartPublic> {
  return readCart(
    await authorizedFetch("/api/cart/items", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  );
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number,
): Promise<CartPublic> {
  return readCart(
    await authorizedFetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    }),
  );
}

export async function removeCartItem(itemId: string): Promise<CartPublic> {
  return readCart(
    await authorizedFetch(`/api/cart/items/${itemId}`, {
      method: "DELETE",
    }),
  );
}

export type OrderLinePublic = {
  id: string;
  productId: string;
  productName: string;
  priceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type OrderPublic = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED";
  totalCents: number;
  rejectionReason: string | null;
  items: OrderLinePublic[];
  createdAt: string;
};

function isOrderPublic(value: unknown): value is OrderPublic {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as {
    id?: unknown;
    status?: unknown;
    totalCents?: unknown;
    items?: unknown;
    createdAt?: unknown;
  };
  return (
    typeof body.id === "string" &&
    typeof body.status === "string" &&
    typeof body.totalCents === "number" &&
    Array.isArray(body.items) &&
    typeof body.createdAt === "string"
  );
}

export async function checkoutOrder(): Promise<OrderPublic> {
  const response = await authorizedFetch("/api/orders", {
    method: "POST",
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось оформить заказ"));
  }
  if (!isOrderPublic(data)) {
    throw new Error("Некорректный ответ заказа");
  }
  return data;
}

function isOrdersList(value: unknown): value is { orders: OrderPublic[] } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as { orders?: unknown };
  if (!Array.isArray(body.orders)) {
    return false;
  }
  return body.orders.every((item) => isOrderPublic(item));
}

export async function fetchMyOrders(): Promise<OrderPublic[]> {
  const response = await authorizedFetch("/api/orders");
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось загрузить заказы"));
  }
  if (!isOrdersList(data)) {
    throw new Error("Некорректный ответ заказов");
  }
  return data.orders;
}

export type SupportTicketPublic = {
  id: string;
  subject: string;
  body: string;
  status: "OPEN" | "CLOSED";
  staffReply: string | null;
  createdAt: string;
  updatedAt: string;
};

function isSupportTicketPublic(value: unknown): value is SupportTicketPublic {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as {
    id?: unknown;
    subject?: unknown;
    body?: unknown;
    status?: unknown;
    createdAt?: unknown;
  };
  return (
    typeof body.id === "string" &&
    typeof body.subject === "string" &&
    typeof body.body === "string" &&
    typeof body.status === "string" &&
    typeof body.createdAt === "string"
  );
}

function isSupportTicketsList(
  value: unknown,
): value is { tickets: SupportTicketPublic[] } {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as { tickets?: unknown };
  if (!Array.isArray(body.tickets)) {
    return false;
  }
  return body.tickets.every((item) => isSupportTicketPublic(item));
}

export async function fetchSupportTickets(): Promise<SupportTicketPublic[]> {
  const response = await authorizedFetch("/api/support/tickets");
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось загрузить обращения"));
  }
  if (!isSupportTicketsList(data)) {
    throw new Error("Некорректный ответ обращений");
  }
  return data.tickets;
}

export async function createSupportTicket(input: {
  subject: string;
  body: string;
}): Promise<SupportTicketPublic> {
  const response = await authorizedFetch("/api/support/tickets", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось отправить обращение"));
  }
  if (!isSupportTicketPublic(data)) {
    throw new Error("Некорректный ответ обращения");
  }
  return data;
}

