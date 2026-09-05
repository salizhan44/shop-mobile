import { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import {
  CATALOG_PROMO_SLIDES,
  type CatalogPromoSlide,
} from "./catalog-promo-slider.shared";

const SCREEN_WIDTH = Dimensions.get("window").width;
/** Соседний слайд выглядит сильнее (+50% к прежним 18). */
const PEER_PEEK = 27;
const SLIDE_GAP = 10;
const SLIDE_WIDTH = SCREEN_WIDTH - PEER_PEEK * 2;
const SNAP_INTERVAL = SLIDE_WIDTH + SLIDE_GAP;
const SLIDE_HEIGHT = Math.round(SLIDE_WIDTH * 0.42);
const AUTOPLAY_MS = 4000;
const SWIPE_DURATION_MS = 650;

const BASE_COUNT = CATALOG_PROMO_SLIDES.length;
/** Три копии подряд — для бесшовного зацикливания. */
const LOOP_SLIDES: CatalogPromoSlide[] = [
  ...CATALOG_PROMO_SLIDES,
  ...CATALOG_PROMO_SLIDES,
  ...CATALOG_PROMO_SLIDES,
];
const MIDDLE_START = BASE_COUNT;

export function CatalogPromoSlider() {
  const scrollRef = useRef<ScrollView>(null);
  const readyRef = useRef(false);
  const indexRef = useRef(MIDDLE_START);
  const offsetRef = useRef(MIDDLE_START * SNAP_INTERVAL);
  const draggingRef = useRef(false);
  const animatingRef = useRef(false);
  const animValueRef = useRef(new Animated.Value(MIDDLE_START * SNAP_INTERVAL));

  useEffect(() => {
    const listenerId = animValueRef.current.addListener(({ value }) => {
      offsetRef.current = value;
      scrollRef.current?.scrollTo({ x: value, animated: false });
    });
    requestAnimationFrame(() => {
      const startX = MIDDLE_START * SNAP_INTERVAL;
      offsetRef.current = startX;
      animValueRef.current.setValue(startX);
      scrollRef.current?.scrollTo({ x: startX, animated: false });
      indexRef.current = MIDDLE_START;
      readyRef.current = true;
    });
    return () => {
      animValueRef.current.removeListener(listenerId);
    };
  }, []);

  function animateToIndex(nextIndex: number) {
    if (animatingRef.current) {
      return;
    }
    const from = offsetRef.current;
    const to = nextIndex * SNAP_INTERVAL;
    animatingRef.current = true;
    indexRef.current = nextIndex;
    animValueRef.current.setValue(from);
    Animated.timing(animValueRef.current, {
      toValue: to,
      duration: SWIPE_DURATION_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(({ finished }) => {
      animatingRef.current = false;
      if (!finished) {
        return;
      }
      offsetRef.current = to;
      if (nextIndex >= BASE_COUNT * 2) {
        const fixed = nextIndex - BASE_COUNT;
        const fixedX = fixed * SNAP_INTERVAL;
        indexRef.current = fixed;
        offsetRef.current = fixedX;
        animValueRef.current.setValue(fixedX);
        scrollRef.current?.scrollTo({ x: fixedX, animated: false });
      }
    });
  }

  useEffect(() => {
    const timer = setInterval(() => {
      if (!readyRef.current || draggingRef.current || animatingRef.current) {
        return;
      }
      animateToIndex(indexRef.current + 1);
    }, AUTOPLAY_MS);

    return () => clearInterval(timer);
  }, []);

  function normalizeLoop(offsetX: number) {
    if (!readyRef.current || animatingRef.current) {
      return;
    }
    let index = Math.round(offsetX / SNAP_INTERVAL);
    if (index < BASE_COUNT) {
      index += BASE_COUNT;
      const x = index * SNAP_INTERVAL;
      offsetRef.current = x;
      animValueRef.current.setValue(x);
      scrollRef.current?.scrollTo({ x, animated: false });
    } else if (index >= BASE_COUNT * 2) {
      index -= BASE_COUNT;
      const x = index * SNAP_INTERVAL;
      offsetRef.current = x;
      animValueRef.current.setValue(x);
      scrollRef.current?.scrollTo({ x, animated: false });
    }
    indexRef.current = index;
    offsetRef.current = index * SNAP_INTERVAL;
  }

  function onMomentumScrollEnd(
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) {
    normalizeLoop(event.nativeEvent.contentOffset.x);
  }

  function onScrollEndDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    draggingRef.current = false;
    normalizeLoop(event.nativeEvent.contentOffset.x);
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        disableIntervalMomentum
        onScrollBeginDrag={() => {
          draggingRef.current = true;
          animValueRef.current.stopAnimation((value) => {
            offsetRef.current = value;
            animatingRef.current = false;
          });
        }}
        onScroll={(event) => {
          if (!animatingRef.current) {
            offsetRef.current = event.nativeEvent.contentOffset.x;
          }
        }}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onScrollEndDrag={onScrollEndDrag}
        contentContainerStyle={styles.track}
      >
        {LOOP_SLIDES.map((slide, index) => (
          <View
            key={`${slide.id}-${index}`}
            style={[
              styles.card,
              {
                backgroundColor: slide.color,
                marginRight: index === LOOP_SLIDES.length - 1 ? 0 : SLIDE_GAP,
              },
            ]}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  track: {
    paddingHorizontal: PEER_PEEK,
  },
  card: {
    width: SLIDE_WIDTH,
    height: SLIDE_HEIGHT,
    borderRadius: 16,
  },
});
