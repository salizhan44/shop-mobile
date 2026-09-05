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
  fetchMyProfile,
  fetchProducts,
  loginCustomer,
  registerCustomer,
  removeCartItem,
  updateCartItemQuantity,
  updateMyProfile,
  type CartPublic,
  type CustomerPublic,
  type OrderPublic,
  type ProductPublic,
  type SupportTicketPublic,
} from "./src/lib/api";
import type { AppScreen } from "./src/lib/app-screen.shared";
import type { AppThemeColors } from "./src/lib/app-theme.shared";
import { ThemeProvider, useAppTheme } from "./src/lib/theme-context";
import type { MainTab } from "./src/lib/main-tab.shared";
import { getMainTabTitle } from "./src/components/AppShell";
import { normalizeSearchQuery } from "./src/lib/catalog-search.shared";
import { UPDATES_POLL_INTERVAL_MS } from "./src/lib/updates.shared";
import { clearSession, loadCustomer, saveCustomer, saveSession } from "./src/lib/session";
import {
  loadFavoriteIds,
  saveFavoriteIds,
  toggleFavoriteId,
} from "./src/lib/favorites-storage";
import { AppHeader } from "./src/components/AppHeader";
import { AppShell } from "./src/components/AppShell";
import { BrandLogo } from "./src/components/BrandLogo";
import { PasswordInput } from "./src/components/PasswordInput";
import { CartScreen } from "./src/screens/CartScreen";
import { CatalogScreen } from "./src/screens/CatalogScreen";
import { CheckoutScreen } from "./src/screens/CheckoutScreen";
import { OrderSuccessScreen } from "./src/screens/OrderSuccessScreen";
import { OrdersScreen } from "./src/screens/OrdersScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { SupportScreen } from "./src/screens/SupportScreen";
import * as ImagePicker from "expo-image-picker";

const emptyCart: CartPublic = { items: [], totalCents: 0 };

function cartItemCount(cart: CartPublic): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const { colors, mode } = useAppTheme();
  const styles = createStyles(colors);
  const [screen, setScreen] = useState<AppScreen>("login");
  const [mainTab, setMainTab] = useState<MainTab>("catalog");
  const [supportOpen, setSupportOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
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
  const [profilePending, setProfilePending] = useState(false);
  const [profileError, setProfileError] = useState("");

  const isLoggedIn = customer !== null;

  useEffect(() => {
    loadCustomer()
      .then(async (saved) => {
        if (!saved) {
          return;
        }
        setCustomer(saved);
        setMainTab("catalog");
        try {
          const profile = await fetchMyProfile();
          setCustomer(profile);
          await saveCustomer(profile);
        } catch {
          // оставляем локальный профиль, если сеть недоступна
        }
      })
      .finally(() => setBooting(false));
    void loadFavoriteIds().then(setFavoriteIds);
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
    setFavoritesOpen(false);
    onClearCatalogSearch();
    setScreen("login");
  }

  async function onToggleFavorite(productId: string) {
    setFavoriteIds((current) => {
      const next = toggleFavoriteId(current, productId);
      void saveFavoriteIds(next);
      return next;
    });
  }

  async function applyProfileUpdate(next: CustomerPublic) {
    setCustomer(next);
    try {
      await saveCustomer(next);
    } catch {
      // токены/локальный кэш не критичны, если API уже сохранил
    }
  }

  async function onSaveProfile(input: {
    name: string;
    homeAddress: string;
  }) {
    setProfilePending(true);
    setProfileError("");
    try {
      const next = await updateMyProfile(input);
      await applyProfileUpdate(next);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Не удалось сохранить профиль";
      setProfileError(message);
      throw caught instanceof Error ? caught : new Error(message);
    } finally {
      setProfilePending(false);
    }
  }

  async function onChangeAvatar() {
    setProfilePending(true);
    setProfileError("");
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        throw new Error("Нужен доступ к фото");
      }
      const picked = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.28,
        base64: true,
      });
      if (picked.canceled || !picked.assets[0]) {
        return;
      }
      const asset = picked.assets[0];
      if (!asset.base64) {
        throw new Error("Не удалось прочитать фото");
      }
      const mime = asset.mimeType ?? "image/jpeg";
      const avatarUrl = `data:${mime};base64,${asset.base64}`;
      if (avatarUrl.length > 1_400_000) {
        throw new Error("Фото слишком большое — выберите другое или обрежьте сильнее");
      }
      const next = await updateMyProfile({ avatarUrl });
      await applyProfileUpdate(next);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Не удалось сменить аватар";
      setProfileError(message);
      throw caught instanceof Error ? caught : new Error(message);
    } finally {
      setProfilePending(false);
    }
  }

  async function onRemoveAvatar() {
    setProfilePending(true);
    setProfileError("");
    try {
      const next = await updateMyProfile({ avatarUrl: "" });
      await applyProfileUpdate(next);
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Не удалось удалить аватар";
      setProfileError(message);
      throw caught instanceof Error ? caught : new Error(message);
    } finally {
      setProfilePending(false);
    }
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

  async function onOpenCheckout() {
    setCartError("");
    if (cart.items.length === 0) {
      setCartError("Корзина пустая");
      return;
    }
    setScreen("checkout");
  }

  async function onSubmitCheckout(input: {
    phone: string;
    address: string;
    comment: string;
  }) {
    setCheckoutPending(true);
    setCartError("");
    try {
      const order = await checkoutOrder(input);
      setLastOrder(order);
      setCart(emptyCart);
      setScreen("orderSuccess");
    } catch (caught) {
      setCartError(
        caught instanceof Error ? caught.message : "Не удалось оформить заказ",
      );
      throw caught;
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
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (isLoggedIn && screen === "checkout") {
    return (
      <CheckoutScreen
        cart={cart}
        error={cartError}
        pending={checkoutPending}
        initialAddress={customer?.homeAddress ?? ""}
        onBack={() => {
          setCartError("");
          setScreen("login");
          setMainTab("cart");
        }}
        onSubmit={onSubmitCheckout}
      />
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

  if (isLoggedIn && favoritesOpen) {
    const favoriteProducts = products.filter((product) =>
      favoriteIds.includes(product.id),
    );
    return (
      <View style={styles.root}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <AppHeader
          title="Избранное"
          onBack={() => setFavoritesOpen(false)}
        />
        <View style={styles.supportBody}>
          {favoriteProducts.length === 0 ? (
            <Text style={{ color: colors.textMuted, padding: 16 }}>
              Пока ничего нет — нажмите ♡ у товара в каталоге.
            </Text>
          ) : (
            <CatalogScreen
              products={favoriteProducts}
              catalogError={catalogError}
              addingProductId={addingProductId}
              searchApplied=""
              favoriteIds={favoriteIds}
              onAdd={onAdd}
              onToggleFavorite={onToggleFavorite}
            />
          )}
        </View>
      </View>
    );
  }

  if (isLoggedIn && supportOpen) {
    return (
      <View style={styles.root}>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
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
        cartItemCount={cartItemCount(cart)}
        ordersHasUpdates={ordersHasUpdates}
        accountMenuOpen={accountMenuOpen}
        catalogChrome={{
          searchBar: {
            value: catalogSearchDraft,
            showClear:
              catalogSearchDraft.length > 0 ||
              catalogSearchApplied.length > 0,
            onChangeText: setCatalogSearchDraft,
            onSubmit: onApplyCatalogSearch,
            onClear: onClearCatalogSearch,
          },
          favoritesActive: favoriteIds.length > 0,
          onOpenMenu: () => {
            Keyboard.dismiss();
            setAccountMenuOpen(true);
          },
          onOpenFavorites: () => {
            Keyboard.dismiss();
            setFavoritesOpen(true);
          },
        }}
        onTabChange={(tab) => {
          Keyboard.dismiss();
          setFavoritesOpen(false);
          setMainTab(tab);
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
            favoriteIds={favoriteIds}
            onAdd={onAdd}
            onToggleFavorite={onToggleFavorite}
          />
        ) : null}
        {mainTab === "cart" ? (
          <CartScreen
            cart={cart}
            error={cartError}
            busyItemId={busyItemId}
            onOpenCheckout={onOpenCheckout}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
          />
        ) : null}
        {mainTab === "orders" ? (
          <OrdersScreen
            orders={orders}
            error={ordersError}
            refreshing={ordersRefreshPending}
            onRefresh={() => {
              void onRefreshOrders();
            }}
          />
        ) : null}
        {mainTab === "profile" && customer ? (
          <ProfileScreen
            customer={customer}
            pending={profilePending}
            error={profileError}
            onSaveProfile={onSaveProfile}
            onChangeAvatar={onChangeAvatar}
            onRemoveAvatar={onRemoveAvatar}
            onLogout={onLogout}
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
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={styles.authBrand}>
        <BrandLogo height={Math.round(56 * 1.9 * 1.6)} />
      </View>
      <Text style={styles.authTitle}>
        {screen === "login" ? "Вход" : "Регистрация"}
      </Text>
      {screen === "register" ? (
        <TextInput
          placeholder="Имя"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />
      ) : null}
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        placeholderTextColor={colors.textMuted}
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
      <View style={styles.themeHintWrap}>
        <AuthThemeToggle />
      </View>
    </View>
  );
}

function AuthThemeToggle() {
  const { mode, toggleMode, colors } = useAppTheme();
  return (
    <Pressable onPress={toggleMode}>
      <Text style={{ color: colors.link, marginTop: 8 }}>
        {mode === "light" ? "Тёмная тема" : "Светлая тема"}
      </Text>
    </Pressable>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.screenBackground,
    },
    root: {
      flex: 1,
      backgroundColor: colors.screenBackground,
    },
    supportBody: {
      flex: 1,
    },
    authContainer: {
      flex: 1,
      padding: 24,
      gap: 12,
      backgroundColor: colors.screenBackground,
      justifyContent: "center",
    },
    authBrand: {
      alignItems: "center",
      gap: 10,
      marginBottom: 8,
    },
    authTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.inputBackground,
      color: colors.textPrimary,
    },
    button: {
      backgroundColor: colors.buttonBackground,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: "600",
    },
    link: {
      color: colors.link,
    },
    error: {
      color: colors.error,
    },
    themeHintWrap: {
      alignItems: "center",
      marginTop: 4,
    },
  });
}
