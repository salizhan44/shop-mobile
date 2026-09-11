import Constants from "expo-constants";
import { Platform } from "react-native";

import {
  getAccessToken,
  getRefreshToken,
  saveSession,
} from "./session";
import {
  isUpdatesCheckPublic,
  type UpdatesCheckPublic,
} from "./updates.shared";

export type CustomerPublic = {
  id: string;
  email: string;
  name: string;
  homeAddress: string;
  avatarUrl: string;
  hasPassword: boolean;
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
  imageUrl: string;
  categoryId: string | null;
  subcategoryId: string | null;
};

export type ApiErrorBody = {
  error: string;
};

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

function isLoopbackApiUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return true;
  }
}

function isPrivateLanHost(host: string): boolean {
  return (
    /^10\.\d+\.\d+\.\d+$/.test(host) ||
    /^192\.168\.\d+\.\d+$/.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/.test(host)
  );
}

function isMetroTunnelHost(host: string): boolean {
  const lower = host.toLowerCase();
  return (
    lower.endsWith(".exp.direct") ||
    lower.endsWith(".exp.host") ||
    lower.includes("ngrok") ||
    lower.endsWith(".expo.dev")
  );
}

function resolveApiUrl(): string {
  const fromEnv = (process.env.EXPO_PUBLIC_API_URL ?? "").trim();
  if (Platform.OS === "web") {
    return fromEnv.length > 0
      ? stripTrailingSlash(fromEnv)
      : "http://localhost:3000";
  }
  if (fromEnv.length > 0 && !isLoopbackApiUrl(fromEnv)) {
    return stripTrailingSlash(fromEnv);
  }
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  if (host && isPrivateLanHost(host) && !isMetroTunnelHost(host)) {
    return `http://${host}:3000`;
  }
  if (fromEnv.length > 0) {
    return stripTrailingSlash(fromEnv);
  }
  return "http://localhost:3000";
}

const API_URL = resolveApiUrl();

async function publicApiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  try {
    return await fetch(`${API_URL}${path}`, init);
  } catch {
    throw new Error(
      "Нет связи с сервером. Телефон и компьютер должны быть в одной Wi‑Fi сети.",
    );
  }
}

/** Абсолютный URL для аватаров и прочих /uploads с API. */
export function resolveMediaUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }
  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${API_URL}${trimmed}`;
  }
  return `${API_URL}/${trimmed}`;
}

function readCustomerPayload(data: unknown): CustomerPublic | null {
  if (!data || typeof data !== "object" || !("customer" in data)) {
    return null;
  }
  const raw = (data as { customer: unknown }).customer;
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const body = raw as Record<string, unknown>;
  if (
    typeof body.id !== "string" ||
    typeof body.email !== "string" ||
    typeof body.name !== "string"
  ) {
    return null;
  }
  const avatarUrl =
    typeof body.avatarUrl === "string" ? body.avatarUrl : "";
  return {
    id: body.id,
    email: body.email,
    name: body.name,
    homeAddress:
      typeof body.homeAddress === "string" ? body.homeAddress : "",
    avatarUrl: resolveMediaUrl(avatarUrl),
    hasPassword: body.hasPassword !== false,
  };
}

async function parseJson(response: Response): Promise<unknown> {
  return response.json().catch(() => null);
}

export async function registerCustomer(input: {
  name: string;
  email: string;
  password: string;
}): Promise<CustomerAuthSuccess> {
  const response = await publicApiFetch("/api/auth/customer/register", {
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
  return normalizeAuthSuccess(data);
}

export async function loginCustomer(input: {
  email: string;
  password: string;
}): Promise<CustomerAuthSuccess> {
  const response = await publicApiFetch("/api/auth/customer/login", {
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
  return normalizeAuthSuccess(data);
}

export async function loginWithGoogleIdToken(
  idToken: string,
): Promise<CustomerAuthSuccess> {
  const response = await publicApiFetch("/api/auth/customer/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as ApiErrorBody).error)
        : "Не удалось войти через Google";
    throw new Error(message);
  }
  return normalizeAuthSuccess(data);
}

function normalizeAuthSuccess(data: unknown): CustomerAuthSuccess {
  if (!data || typeof data !== "object") {
    throw new Error("Некорректный ответ сервера");
  }
  const body = data as Record<string, unknown>;
  if (
    typeof body.accessToken !== "string" ||
    typeof body.refreshToken !== "string"
  ) {
    throw new Error("Некорректный ответ сервера");
  }
  const customer = readCustomerPayload({ customer: body.customer });
  if (!customer) {
    throw new Error("Некорректный ответ сервера");
  }
  return {
    accessToken: body.accessToken,
    refreshToken: body.refreshToken,
    customer,
  };
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
  return (data as { products: unknown[] }).products.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const body = item as Record<string, unknown>;
    if (
      typeof body.id !== "string" ||
      typeof body.name !== "string" ||
      typeof body.description !== "string" ||
      typeof body.priceCents !== "number"
    ) {
      return [];
    }
    return [
      {
        id: body.id,
        name: body.name,
        description: body.description,
        priceCents: body.priceCents,
        imageUrl: resolveMediaUrl(
          typeof body.imageUrl === "string" ? body.imageUrl : "",
        ),
        categoryId:
          typeof body.categoryId === "string" ? body.categoryId : null,
        subcategoryId:
          typeof body.subcategoryId === "string"
            ? body.subcategoryId
            : null,
      },
    ];
  });
}

export type CategoryOptionPublic = {
  id: string;
  name: string;
  subcategories: Array<{ id: string; name: string }>;
};

export async function fetchCategories(): Promise<CategoryOptionPublic[]> {
  const response = await fetch(`${API_URL}/api/categories`);
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error("Не удалось загрузить категории");
  }
  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as { categories?: unknown }).categories)
  ) {
    return [];
  }
  return (data as { categories: unknown[] }).categories.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const body = item as Record<string, unknown>;
    if (typeof body.id !== "string" || typeof body.name !== "string") {
      return [];
    }
    const subcategories = Array.isArray(body.subcategories)
      ? body.subcategories.flatMap((sub) => {
          if (!sub || typeof sub !== "object") {
            return [];
          }
          const row = sub as Record<string, unknown>;
          if (typeof row.id !== "string" || typeof row.name !== "string") {
            return [];
          }
          return [{ id: row.id, name: row.name }];
        })
      : [];
    return [{ id: body.id, name: body.name, subcategories }];
  });
}

export type CartLinePublic = {
  id: string;
  productId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
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

function normalizeCart(data: CartPublic): CartPublic {
  return {
    totalCents: data.totalCents,
    items: data.items.map((item) => ({
      ...item,
      imageUrl: resolveMediaUrl(
        typeof item.imageUrl === "string" ? item.imageUrl : "",
      ),
    })),
  };
}

function errorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && "error" in data) {
    const raw = String((data as ApiErrorBody).error ?? "").trim();
    if (!raw) {
      return fallback;
    }
    // Не показываем сырые стеки Prisma/Next в UI.
    if (
      raw.length > 180 ||
      raw.includes("Prisma") ||
      raw.includes("\n") ||
      raw.includes("at ")
    ) {
      return fallback;
    }
    return raw;
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
  await saveSession(normalizeAuthSuccess(data));
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
  return normalizeCart(data);
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
  discountCents: number;
  promoCode: string;
  phone: string;
  address: string;
  comment: string | null;
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
    discountCents?: unknown;
    promoCode?: unknown;
    phone?: unknown;
    address?: unknown;
    items?: unknown;
    createdAt?: unknown;
  };
  const discountCents =
    typeof body.discountCents === "number" ? body.discountCents : 0;
  const promoCode = typeof body.promoCode === "string" ? body.promoCode : "";
  return (
    typeof body.id === "string" &&
    typeof body.status === "string" &&
    typeof body.totalCents === "number" &&
    discountCents >= 0 &&
    typeof promoCode === "string" &&
    typeof body.phone === "string" &&
    typeof body.address === "string" &&
    Array.isArray(body.items) &&
    typeof body.createdAt === "string"
  );
}

export async function checkoutOrder(input: {
  phone: string;
  address: string;
  comment: string;
  promoCode?: string;
}): Promise<OrderPublic> {
  const response = await authorizedFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
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

export type PromoQuotePublic = {
  code: string;
  kind: "PERCENT" | "AMOUNT" | "FREE_DELIVERY" | "FREE_PRODUCT";
  discountCents: number;
  payableCents: number;
  giftProductName: string | null;
  message: string;
};

function isPromoQuotePublic(value: unknown): value is PromoQuotePublic {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const body = value as Record<string, unknown>;
  return (
    typeof body.code === "string" &&
    typeof body.kind === "string" &&
    typeof body.discountCents === "number" &&
    typeof body.payableCents === "number" &&
    (body.giftProductName === null || typeof body.giftProductName === "string") &&
    typeof body.message === "string"
  );
}

export async function previewPromoCode(code: string): Promise<PromoQuotePublic> {
  const response = await authorizedFetch("/api/promo/preview", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось применить промокод"));
  }
  if (!isPromoQuotePublic(data)) {
    throw new Error("Некорректный ответ промокода");
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
  imageUrls: string[];
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
    imageUrls?: unknown;
  };
  if (
    typeof body.id !== "string" ||
    typeof body.subject !== "string" ||
    typeof body.body !== "string" ||
    typeof body.status !== "string" ||
    typeof body.createdAt !== "string"
  ) {
    return false;
  }
  if (body.imageUrls !== undefined) {
    if (
      !Array.isArray(body.imageUrls) ||
      !body.imageUrls.every((item) => typeof item === "string")
    ) {
      return false;
    }
  }
  return true;
}

function normalizeSupportTicket(ticket: SupportTicketPublic): SupportTicketPublic {
  return {
    ...ticket,
    imageUrls: (ticket.imageUrls ?? []).map((url) => resolveMediaUrl(url)),
  };
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
  return data.tickets.map((ticket) => normalizeSupportTicket(ticket));
}

export async function createSupportTicket(input: {
  subject: string;
  body: string;
  imageUrls?: string[];
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
  return normalizeSupportTicket(data);
}

async function readUpdatesCheck(response: Response): Promise<UpdatesCheckPublic> {
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось проверить обновления"));
  }
  if (!isUpdatesCheckPublic(data)) {
    throw new Error("Некорректный ответ обновлений");
  }
  return data;
}

export async function fetchOrderUpdates(
  since: string | null,
): Promise<UpdatesCheckPublic> {
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return readUpdatesCheck(await authorizedFetch(`/api/orders/updates${query}`));
}

export async function fetchSupportTicketUpdates(
  since: string | null,
): Promise<UpdatesCheckPublic> {
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return readUpdatesCheck(
    await authorizedFetch(`/api/support/tickets/updates${query}`),
  );
}

export async function fetchMyProfile(): Promise<CustomerPublic> {
  const response = await authorizedFetch("/api/customer/me");
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось загрузить профиль"));
  }
  const customer = readCustomerPayload(data);
  if (!customer) {
    throw new Error("Некорректный ответ профиля");
  }
  return customer;
}

export async function updateMyProfile(input: {
  name?: string;
  homeAddress?: string;
  avatarUrl?: string | null;
}): Promise<CustomerPublic> {
  const response = await authorizedFetch("/api/customer/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось сохранить профиль"));
  }
  const customer = readCustomerPayload(data);
  if (!customer) {
    throw new Error("Некорректный ответ профиля");
  }
  return customer;
}

export async function verifyMyPassword(currentPassword: string): Promise<void> {
  const response = await authorizedFetch("/api/customer/me/password/verify", {
    method: "POST",
    body: JSON.stringify({ currentPassword }),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Неверный текущий пароль"));
  }
}

export async function changeMyPassword(input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  const response = await authorizedFetch("/api/customer/me/password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось сменить пароль"));
  }
}

export async function registerPushToken(
  token: string,
  platform: "ios" | "android" | "web" | "unknown",
): Promise<void> {
  const response = await authorizedFetch("/api/customer/push-token", {
    method: "POST",
    body: JSON.stringify({ token, platform }),
  });
  const data = await parseJson(response);
  if (!response.ok) {
    throw new Error(errorMessage(data, "Не удалось сохранить push-токен"));
  }
}

