import * as React from "react";
import { Keyboard, LayoutAnimation, Platform } from "react-native";
import { UIManager } from "react-native";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const useKeyboardHeight = (): number => {
  const [height, setHeight] = React.useState(0);

  React.useEffect(() => {
    let showSub: { remove: () => void } | null = null;
    let hideSub: { remove: () => void } | null = null;

    try {
      showSub = Keyboard.addListener("keyboardDidShow", (event) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setHeight(event.endCoordinates?.height ?? 0);
      });
      hideSub = Keyboard.addListener("keyboardDidHide", () => {
        setHeight(0);
      });
    } catch {
      setHeight(0);
    }

    return () => {
      showSub?.remove();
      hideSub?.remove();
    };
  }, []);

  return height;
};
