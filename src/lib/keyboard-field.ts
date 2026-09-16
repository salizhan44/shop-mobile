import { useEffect, useRef, useState, type RefObject } from "react";
import {
  Dimensions,
  Keyboard,
  Platform,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type ScrollView,
  type View,
} from "react-native";

/** Запас под строку подсказок над клавиатурой. */
export const KEYBOARD_SUGGESTIONS_EXTRA = 52;

export function useKeepFocusedInputVisible(extraCover = 0) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollYRef = useRef(0);
  const extraCoverRef = useRef(extraCover);
  extraCoverRef.current = extraCover;
  const keyboardCoverRef = useRef(0);
  const [keyboardPad, setKeyboardPad] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = Keyboard.addListener(showEvent, (event) => {
      const keyboardHeight = event.endCoordinates.height;
      if (Platform.OS === "ios") {
        keyboardCoverRef.current =
          keyboardHeight + KEYBOARD_SUGGESTIONS_EXTRA;
        setKeyboardPad(KEYBOARD_SUGGESTIONS_EXTRA);
        return;
      }
      const overlap = Math.max(
        0,
        Dimensions.get("window").height - event.endCoordinates.screenY,
      );
      const cover = overlap + KEYBOARD_SUGGESTIONS_EXTRA;
      keyboardCoverRef.current = cover;
      setKeyboardPad(cover);
    });
    const onHide = Keyboard.addListener(hideEvent, () => {
      keyboardCoverRef.current = 0;
      setKeyboardPad(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  function keepFieldVisible(wrapRef: RefObject<View | null>) {
    const wrap = wrapRef.current;
    if (!wrap) {
      return;
    }
    wrap.measureInWindow((_x, y, _width, height) => {
      const windowHeight = Dimensions.get("window").height;
      const cover =
        Math.max(keyboardCoverRef.current, KEYBOARD_SUGGESTIONS_EXTRA) +
        extraCoverRef.current;
      const safeBottom = windowHeight - cover - 8;
      const fieldBottom = y + height;
      if (fieldBottom <= safeBottom) {
        return;
      }
      const delta = fieldBottom - safeBottom;
      scrollRef.current?.scrollTo({
        y: Math.max(0, scrollYRef.current + delta),
        animated: true,
      });
    });
  }

  function onFocusField(wrapRef: RefObject<View | null>) {
    setTimeout(() => keepFieldVisible(wrapRef), 100);
    setTimeout(() => keepFieldVisible(wrapRef), 320);
  }

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    scrollYRef.current = event.nativeEvent.contentOffset.y;
  }

  return {
    scrollRef,
    keyboardPad,
    onScroll,
    onFocusField,
    automaticallyAdjustKeyboardInsets: Platform.OS === "ios",
  };
}
