import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { AppThemeColors } from "../lib/app-theme.shared";
import { useAppTheme } from "../lib/theme-context";
import {
  dgisRouteAppUrl,
  formatEtaLabel,
  type OrderDeliveryPublic,
} from "../lib/delivery.shared";

export function DeliveryMapCard(
  props: OrderDeliveryPublic & { address: string },
) {
  const { colors } = useAppTheme();
  const styles = createStyles(colors);
  const eta =
    props.etaMinutes != null ? formatEtaLabel(props.etaMinutes) : "считаем маршрут";

  async function openMap() {
    if (props.destLat != null && props.destLng != null) {
      const appUrl = dgisRouteAppUrl(
        { lat: props.shopLat, lng: props.shopLng },
        { lat: props.destLat, lng: props.destLng },
      );
      try {
        await Linking.openURL(appUrl);
        return;
      } catch {
        // нет приложения 2ГИС — сайт
      }
    }
    await WebBrowser.openBrowserAsync(props.dgisUrl);
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Машина найдена</Text>
        <Text style={styles.bannerEta}>До вас {eta}</Text>
      </View>
      <View style={styles.map} accessibilityLabel="Карта маршрута">
        <View style={styles.gridLine} />
        <View style={[styles.gridLine, styles.gridLineMid]} />
        <View style={styles.route} />
        <View style={[styles.pin, styles.pinShop]}>
          <Text style={styles.pinLabel}>Склад</Text>
        </View>
        <View style={[styles.pin, styles.pinDest]}>
          <Text style={styles.pinLabel}>Вы</Text>
        </View>
      </View>
      <Text style={styles.address} numberOfLines={2}>
        {props.address}
      </Text>
      <Pressable onPress={() => void openMap()} style={styles.button}>
        <Text style={styles.buttonText}>Открыть в 2ГИС</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors: AppThemeColors) {
  return StyleSheet.create({
    wrap: {
      gap: 8,
      marginTop: 4,
    },
    banner: {
      borderRadius: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: colors.searchBackground,
      gap: 2,
    },
    bannerTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.textPrimary,
    },
    bannerEta: {
      fontSize: 13,
      color: colors.textMuted,
    },
    map: {
      height: 132,
      borderRadius: 12,
      overflow: "hidden",
      backgroundColor: "#c5ccd3",
      position: "relative",
    },
    gridLine: {
      position: "absolute",
      left: 16,
      right: 16,
      top: 44,
      height: 1,
      backgroundColor: "rgba(255,255,255,0.45)",
    },
    gridLineMid: {
      top: 88,
    },
    route: {
      position: "absolute",
      left: 28,
      right: 28,
      top: 58,
      height: 3,
      borderRadius: 2,
      backgroundColor: "#5b6570",
      transform: [{ rotate: "-8deg" }],
    },
    pin: {
      position: "absolute",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: "rgba(255,255,255,0.92)",
    },
    pinShop: {
      left: 12,
      top: 14,
    },
    pinDest: {
      right: 12,
      bottom: 14,
    },
    pinLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: "#334155",
    },
    address: {
      fontSize: 12,
      color: colors.textMuted,
    },
    button: {
      alignSelf: "flex-start",
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.buttonBackground,
    },
    buttonText: {
      color: colors.buttonText,
      fontWeight: "700",
      fontSize: 13,
    },
  });
}
