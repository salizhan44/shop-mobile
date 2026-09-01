import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  addProductToCart,
  checkoutOrder,
  fetchCart,
  createSupportTicket,
  fetchOrderUpdates,
  fetchSupportTickets,
  fetchSupportTicketUpdates,
  fetchMyOrders,
  fetchProducts,
  loginCustomer,
  registerCustomer,
  removeCartItem,
  updateCartItemQuantity,
  type CartPublic,
  type CustomerPublic,
  type OrderPublic,
  type ProductPublic,
  type SupportTicketPublic,
} from "./src/lib/api";
import type { AppScreen } from "./src/lib/app-screen.shared";
import { APP_THEME } from "./src/lib/app-theme.shared";
import type { MainTab } from "./src/lib/main-tab.shared";
import { getMainTabTitle } from "./src/components/AppShell";
import { normalizeSearchQuery } from "./src/lib/catalog-search.shared";
import { UPDATES_POLL_INTERVAL_MS } from "./src/lib/updates.shared";
import { clearSession, loadCustomer, saveSession } from "./src/lib/session";
import { AppHeader } from "./src/components/AppHeader";
import { AppShell } from "./src/components/AppShell";
import { PasswordInput } from "./src/components/PasswordInput";
import { CartScreen } from "./src/screens/CartScreen";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { OrderSuccessScreen } from "./src/screens/OrderSuccessScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { SupportScreen } from "./src/screens/SupportScreen";

const emptyCart: CartPublic = { items: [], totalCents: 0 };

function cartItemCount(cart: CartPublic): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [screen, setScreen] = useState<AppScreen>("login");
  const [mainTab, setMainTab] = useState<MainTab>("catalog");
  const [supportOpen, setSupportOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [booting, setBooting] = useState(true);
  const [customer, setCustomer] = useState<CustomerPublic | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [products, setProducts] = useState<ProductPublic[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [cart, setCart] = useState<CartPublic>(emptyCart);
  const [cartError, setCartError] = useState("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [lastOrder, setLastOrder] = useState<OrderPublic | null>(null);
  const [orders, setOrders] = useState<OrderPublic[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [tickets, setTickets] = useState<SupportTicketPublic[]>([]);
  const [supportError, setSupportError] = useState("");
  const [supportPending, setSupportPending] = useState(false);
  const [ordersSeenAt, setOrdersSeenAt] = useState(() => new Date().toISOString());
  const [ordersHasUpdates, setOrdersHasUpdates] = useState(false);
  const [ordersRefreshPending, setOrdersRefreshPending] = useState(false);
  const [supportSeenAt, setSupportSeenAt] = useState(() => new Date().toISOString());
  const [supportHasUpdates, setSupportHasUpdates] = useState(false);
  const [supportRefreshPending, setSupportRefreshPending] = useState(false);
  const [catalogSearchDraft, setCatalogSearchDraft] = useState("");
  const [catalogSearchApplied, setCatalogSearchApplied] = useState("");

  const isLoggedIn = customer !== null;

  useEffect(() => {
    loadCustomer()
      .then((saved) => {
        if (saved) {
          setCustomer(saved);
          setMainTab("catalog");
        }
      })
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    fetchCart()
      .then(setCart)
      .catch(() => setCart(emptyCart));
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn || mainTab !== "catalog" || supportOpen) {
      return;
    }
    setCatalogError("");
    fetchProducts()
      .then(setProducts)
      .catch((caught: unknown) => {
        setProducts([]);
        setCatalogError(
          caught instanceof Error ? caught.message : "Не удалось загрузить каталог",
        );
      });
  }, [isLoggedIn, mainTab, supportOpen]);

  useEffect(() => {
    if (!isLoggedIn || mainTab !== "cart" || supportOpen) {
      return;
    }
    setCartError("");
    fetchCart()
      .then(setCart)
      .catch((caught: unknown) => {
        setCart(emptyCart);
        setCartError(caught instanceof Error ? caught.message : "Ошибка корзины");
      });
  }, [isLoggedIn, mainTab, supportOpen]);

  useEffect(() => {
    if (!isLoggedIn || mainTab !== "orders" || supportOpen) {
      return;
    }
    setOrdersError("");
    fetchMyOrders()
      .then(setOrders)
      .catch((caught: unknown) => {
        setOrders([]);
        setOrdersError(
          caught instanceof Error ? caught.message : "Не удалось загрузить заказы",
        );
      })
      .finally(() => {
        void fetchOrderUpdates(null)
          .then((check) => {
            setOrdersSeenAt(check.latestAt ?? new Date().toISOString());
            setOrdersHasUpdates(false);
          })
          .catch(() => undefined);
      });
  }, [isLoggedIn, mainTab, supportOpen]);

  useEffect(() => {
    if (!isLoggedIn || mainTab !== "orders" || supportOpen) {
      return;
    }
    let cancelled = false;

    async function poll() {
      try {
        const check = await fetchOrderUpdates(ordersSeenAt);
        if (!cancelled && check.hasUpdates) {
          setOrdersHasUpdates(true);
        }
      } catch {
        // тихо игнорируем сбои опроса
      }
    }

    const interval = setInterval(() => {
      void poll();
    }, UPDATES_POLL_INTERVAL_MS);
    void poll();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoggedIn, mainTab, supportOpen, ordersSeenAt]);

  useEffect(() => {
    if (!isLoggedIn || !supportOpen) {
      return;
    }
    setSupportError("");
    fetchSupportTickets()
      .then(setTickets)
      .catch((caught: unknown) => {
        setTickets([]);
        setSupportError(
          caught instanceof Error
            ? caught.message
            : "Не удалось загрузить обращения",
        );
      })
      .finally(() => {
        void fetchSupportTicketUpdates(null)
          .then((check) => {
            setSupportSeenAt(check.latestAt ?? new Date().toISOString());
            setSupportHasUpdates(false);
          })
          .catch(() => undefined);
      });
  }, [isLoggedIn, supportOpen]);

  useEffect(() => {
    if (!isLoggedIn || !supportOpen) {
      return;
    }
    let cancelled = false;

    async function poll() {
      try {
        const check = await fetchSupportTicketUpdates(supportSeenAt);
        if (!cancelled && check.hasUpdates) {
          setSupportHasUpdates(true);
        }
      } catch {
        // тихо игнорируем сбои опроса
      }
    }

    const interval = setInterval(() => {
      void poll();
    }, UPDATES_POLL_INTERVAL_MS);
    void poll();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [isLoggedIn, supportOpen, supportSeenAt]);

  async function onLogin() {
    setError("");
    setPending(true);
    try {
      const auth = await loginCustomer({ email, password });
      await saveSession(auth);
      setCustomer(auth.customer);
      setPassword("");
      setMainTab("catalog");
      setSupportOpen(false);
      setAccountMenuOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка входа");
    } finally {
      setPending(false);
    }
  }

  async function onRegister() {
    setError("");
    setPending(true);
    try {
      const auth = await registerCustomer({ name, email, password });
      await saveSession(auth);
      setCustomer(auth.customer);
      setPassword("");
      setMainTab("catalog");
      setSupportOpen(false);
      setAccountMenuOpen(false);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка регистрации");
    } finally {
      setPending(false);
    }
  }

  function onApplyCatalogSearch() {
    setCatalogSearchApplied(normalizeSearchQuery(catalogSearchDraft));
  }

  function onClearCatalogSearch() {
    setCatalogSearchDraft("");
    setCatalogSearchApplied("");
  }

  async function onLogout() {
    await clearSession();
    setCustomer(null);
    setCart(emptyCart);
    setSupportOpen(false);
    setAccountMenuOpen(false);
    onClearCatalogSearch();
    setScreen("login");
  }

  async function onAdd(productId: string) {
    setAddingProductId(productId);
    setCatalogError("");
    try {
      setCart(await addProductToCart(productId));
    } catch (caught) {
      setCatalogError(caught instanceof Error ? caught.message : "Не удалось добавить");
    } finally {
      setAddingProductId(null);
    }
  }

  async function onIncrease(itemId: string, quantity: number) {
    setBusyItemId(itemId);
    setCartError("");
    try {
      setCart(await updateCartItemQuantity(itemId, quantity + 1));
    } catch (caught) {
      setCartError(caught instanceof Error ? caught.message : "Не удалось изменить");
    } finally {
      setBusyItemId(null);
    }
  }

  async function onDecrease(itemId: string, quantity: number) {
    setBusyItemId(itemId);
    setCartError("");
    try {
      setCart(await updateCartItemQuantity(itemId, quantity - 1));
    } catch (caught) {
      setCartError(caught instanceof Error ? caught.message : "Не удалось изменить");
    } finally {
      setBusyItemId(null);
    }
  }

  async function onRemove(itemId: string) {
    setBusyItemId(itemId);
    setCartError("");
    try {
      setCart(await removeCartItem(itemId));
    } catch (caught) {
      setCartError(caught instanceof Error ? caught.message : "Не удалось убрать");
    } finally {
      setBusyItemId(null);
    }
  }

  async function onCheckout() {
    setCheckoutPending(true);
    setCartError("");
    try {
      const order = await checkoutOrder();
      setLastOrder(order);
      setCart(emptyCart);
      setScreen("orderSuccess");
    } catch (caught) {
      setCartError(
        caught instanceof Error ? caught.message : "Не удалось оформить заказ",
      );
    } finally {
      setCheckoutPending(false);
    }
  }

  function onBackToCatalog() {
    setLastOrder(null);
    setScreen("login");
    setMainTab("catalog");
  }

  function onOpenOrdersFromSuccess() {
    setLastOrder(null);
    setScreen("login");
    setMainTab("orders");
  }

  async function onRefreshOrders() {
    setOrdersRefreshPending(true);
    setOrdersHasUpdates(false);
    setOrdersError("");
    try {
      setOrders(await fetchMyOrders());
      const check = await fetchOrderUpdates(null);
      setOrdersSeenAt(check.latestAt ?? new Date().toISOString());
    } catch (caught) {
      setOrdersError(
        caught instanceof Error ? caught.message : "Не удалось загрузить заказы",
      );
    } finally {
      setOrdersRefreshPending(false);
    }
  }

  async function onRefreshSupport() {
    setSupportRefreshPending(true);
    setSupportHasUpdates(false);
    setSupportError("");
    try {
      setTickets(await fetchSupportTickets());
      const check = await fetchSupportTicketUpdates(null);
      setSupportSeenAt(check.latestAt ?? new Date().toISOString());
    } catch (caught) {
      setSupportError(
        caught instanceof Error
          ? caught.message
          : "Не удалось загрузить обращения",
      );
    } finally {
      setSupportRefreshPending(false);
    }
  }

  async function onCreateSupportTicket(subject: string, body: string) {
    setSupportPending(true);
    setSupportError("");
    try {
      await createSupportTicket({ subject, body });
      setTickets(await fetchSupportTickets());
      const check = await fetchSupportTicketUpdates(null);
      setSupportSeenAt(check.latestAt ?? new Date().toISOString());
      setSupportHasUpdates(false);
    } finally {
      setSupportPending(false);
    }
  }

  if (booting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={APP_THEME.accent} />
      </View>
    );
  }

  if (isLoggedIn && screen === "orderSuccess" && lastOrder) {
    return (
      <OrderSuccessScreen
        order={lastOrder}
        onBackToCatalog={onBackToCatalog}
        onOpenOrders={onOpenOrdersFromSuccess}
      />
    );
  }

  if (isLoggedIn && supportOpen) {
    return (
      <View style={styles.root}>
        <StatusBar style="dark" />
        <AppHeader
          title="Поддержка"
          onBack={() => setSupportOpen(false)}
        />
        <View style={styles.supportBody}>
          <SupportScreen
              tickets={tickets}
              error={supportError}
              submitPending={supportPending}
              hasUpdates={supportHasUpdates}
              refreshPending={supportRefreshPending}
              onRefresh={onRefreshSupport}
              onCreate={onCreateSupportTicket}
            />
        </View>
      </View>
    );
  }

  if (isLoggedIn) {
    return (
      <AppShell
        activeTab={mainTab}
        title={getMainTabTitle(mainTab)}
        customerName={customer?.name ?? ""}
        cartItemCount={cartItemCount(cart)}
        ordersHasUpdates={ordersHasUpdates}
        accountMenuOpen={accountMenuOpen}
        catalogSearch={{
          value: catalogSearchDraft,
          showClear:
            catalogSearchDraft.length > 0 || catalogSearchApplied.length > 0,
          onChangeText: setCatalogSearchDraft,
          onSubmit: onApplyCatalogSearch,
          onClear: onClearCatalogSearch,
        }}
        onTabChange={(tab) => {
          Keyboard.dismiss();
          setMainTab(tab);
        }}
        onOpenAccountMenu={() => {
          Keyboard.dismiss();
          setAccountMenuOpen(true);
        }}
        onCloseAccountMenu={() => setAccountMenuOpen(false)}
        onOpenSupport={() => setSupportOpen(true)}
        onLogout={onLogout}
      >
        {mainTab === "catalog" ? (
          <CatalogScreen
            products={products}
            catalogError={catalogError}
            addingProductId={addingProductId}
            searchApplied={catalogSearchApplied}
            onAdd={onAdd}
          />
        ) : null}
        {mainTab === "cart" ? (
          <CartScreen
            cart={cart}
            error={cartError}
            busyItemId={busyItemId}
            checkoutPending={checkoutPending}
            onCheckout={onCheckout}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
          />
        ) : null}
        {mainTab === "orders" ? (
          <OrdersScreen
            orders={orders}
            error={ordersError}
            hasUpdates={ordersHasUpdates}
            refreshPending={ordersRefreshPending}
            onRefresh={onRefreshOrders}
          />
        ) : null}
      </AppShell>
    );
  }

  return (
    <View
      style={[
        styles.authContainer,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <StatusBar style="dark" />
      <Text style={styles.authTitle}>
        {screen === "login" ? "Вход" : "Регистрация"}
      </Text>
      {screen === "register" ? (
        <TextInput
          placeholder="Имя"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={APP_THEME.textMuted}
        />
      ) : null}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor={APP_THEME.textMuted}
      />
      <PasswordInput
        value={password}
        onChangeText={setPassword}
        placeholder="Пароль"
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        onPress={screen === "login" ? onLogin : onRegister}
        disabled={pending}
        style={styles.button}
      >
        <Text style={styles.buttonText}>
          {pending ? "Подождите…" : screen === "login" ? "Войти" : "Создать аккаунт"}
        </Text>
      </Pressable>
      <Pressable
        onPress={() => {
          setError("");
          setScreen(screen === "login" ? "register" : "login");
        }}
      >
        <Text style={styles.link}>
          {screen === "login"
            ? "Нет аккаунта? Регистрация"
            : "Уже есть аккаунт? Вход"}
        </Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.screenBackground,
  },
  root: {
    flex: 1,
    backgroundColor: APP_THEME.screenBackground,
  },
  supportBody: {
    flex: 1,
  },
  authContainer: {
    flex: 1,
    padding: 24,
    gap: 12,
    backgroundColor: APP_THEME.screenBackground,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: APP_THEME.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: APP_THEME.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: APP_THEME.cardBackground,
    color: APP_THEME.textPrimary,
  },
  button: {
    backgroundColor: APP_THEME.buttonBackground,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: {
    color: APP_THEME.buttonText,
    fontWeight: "600",
  },
  link: {
    color: APP_THEME.link,
  },
  error: {
    color: APP_THEME.error,
  },
});
