import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  addProductToCart,
  checkoutOrder,
  fetchCart,
  createSupportTicket,
  fetchSupportTickets,
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
import { clearSession, loadCustomer, saveSession } from "./src/lib/session";
import { CartScreen } from "./src/screens/CartScreen";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { OrderSuccessScreen } from "./src/screens/OrderSuccessScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { SupportScreen } from "./src/screens/SupportScreen";

const emptyCart: CartPublic = { items: [], totalCents: 0 };

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("login");
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

  useEffect(() => {
    loadCustomer()
      .then((saved) => {
        if (saved) {
          setCustomer(saved);
          setScreen("catalog");
        }
      })
      .finally(() => setBooting(false));
  }, []);

  useEffect(() => {
    if (screen !== "catalog") {
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
  }, [screen]);

  useEffect(() => {
    if (screen !== "cart") {
      return;
    }
    setCartError("");
    fetchCart()
      .then(setCart)
      .catch((caught: unknown) => {
        setCart(emptyCart);
        setCartError(caught instanceof Error ? caught.message : "Ошибка корзины");
      });
  }, [screen]);

  useEffect(() => {
    if (screen !== "orders") {
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
      });
  }, [screen]);

  useEffect(() => {
    if (screen !== "support") {
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
      });
  }, [screen]);

  async function onLogin() {
    setError("");
    setPending(true);
    try {
      const auth = await loginCustomer({ email, password });
      await saveSession(auth);
      setCustomer(auth.customer);
      setPassword("");
      setScreen("catalog");
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
      setScreen("catalog");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Ошибка регистрации");
    } finally {
      setPending(false);
    }
  }

  async function onLogout() {
    await clearSession();
    setCustomer(null);
    setCart(emptyCart);
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
    setScreen("catalog");
  }

  function onOpenOrders() {
    setScreen("orders");
  }

  function onOpenSupport() {
    setScreen("support");
  }

  async function onCreateSupportTicket(subject: string, body: string) {
    setSupportPending(true);
    setSupportError("");
    try {
      await createSupportTicket({ subject, body });
      setTickets(await fetchSupportTickets());
    } finally {
      setSupportPending(false);
    }
  }

  if (booting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (screen === "catalog") {
    return (
      <CatalogScreen
        customerName={customer?.name ?? ""}
        products={products}
        catalogError={catalogError}
        addingProductId={addingProductId}
        onLogout={onLogout}
        onOpenCart={() => setScreen("cart")}
        onOpenOrders={onOpenOrders}
        onOpenSupport={onOpenSupport}
        onAdd={onAdd}
      />
    );
  }

  if (screen === "cart") {
    return (
      <CartScreen
        cart={cart}
        error={cartError}
        busyItemId={busyItemId}
        checkoutPending={checkoutPending}
        onBack={() => setScreen("catalog")}
        onCheckout={onCheckout}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
      />
    );
  }

  if (screen === "orders") {
    return (
      <OrdersScreen
        orders={orders}
        error={ordersError}
        onBack={() => setScreen("catalog")}
      />
    );
  }

  if (screen === "support") {
    return (
      <SupportScreen
        tickets={tickets}
        error={supportError}
        submitPending={supportPending}
        onBack={() => setScreen("catalog")}
        onCreate={onCreateSupportTicket}
      />
    );
  }

  if (screen === "orderSuccess" && lastOrder) {
    return (
      <OrderSuccessScreen
        order={lastOrder}
        onBackToCatalog={onBackToCatalog}
        onOpenOrders={onOpenOrders}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>
        {screen === "login" ? "Вход" : "Регистрация"}
      </Text>
      {screen === "register" ? (
        <TextInput
          placeholder="Имя"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      ) : null}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        placeholder="Пароль"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
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

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: APP_THEME.screenBackground,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 64,
    gap: 12,
    backgroundColor: APP_THEME.screenBackground,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
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
  buttonText: { color: APP_THEME.buttonText },
  link: { color: APP_THEME.link },
  error: { color: APP_THEME.error },
});
