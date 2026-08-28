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
  fetchCart,
  fetchProducts,
  loginCustomer,
  registerCustomer,
  removeCartItem,
  updateCartItemQuantity,
  type CartPublic,
  type CustomerPublic,
  type ProductPublic,
} from "./src/lib/api";
import type { AppScreen } from "./src/lib/app-screen.shared";
import { clearSession, loadCustomer, saveSession } from "./src/lib/session";
import { CartScreen } from "./src/screens/CartScreen";
import { CatalogScreen } from "./src/screens/CatalogScreen";

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
        onBack={() => setScreen("catalog")}
        onIncrease={onIncrease}
        onDecrease={onDecrease}
        onRemove={onRemove}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, padding: 24, paddingTop: 64, gap: 12 },
  title: { fontSize: 24, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#18181b",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff" },
  link: { color: "#2563eb" },
  error: { color: "#b91c1c" },
});
