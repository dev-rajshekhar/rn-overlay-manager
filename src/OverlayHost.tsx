import * as React from "react";
import { BackHandler, View } from "react-native";
import type { Insets, InsetsMode, OverlayItem, OverlayRenderApi } from "./types.js";
import { useOptionalSafeAreaInsets } from "./insets.js";
import { useKeyboardHeight } from "./keyboard.js";
import { registerHost, unregisterHost } from "./devWarnings.js";
import {
  OverlayConfigContext,
  OverlayContext,
  OverlayItemsContext
} from "./OverlayProvider.js";

const sortByPriority = (items: OverlayItem[]): OverlayItem[] => {
  return items
    .slice()
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
};

const OverlayWrapper = React.memo(({ item, keyboardHeight }: { item: OverlayItem, keyboardHeight: number }) => {
  const controller = React.useContext(OverlayContext);
  const config = React.useContext(OverlayConfigContext);
  const safeAreaInsets = useOptionalSafeAreaInsets();

  const resolveInsets = React.useCallback(
    (mode: InsetsMode | undefined): Insets => {
      if (!mode || mode === "none") {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
      if (mode === "safeArea") {
        return safeAreaInsets;
      }
      if (mode === "safeArea+tabBar") {
        return {
          top: safeAreaInsets.top,
          left: safeAreaInsets.left,
          right: safeAreaInsets.right,
          bottom: safeAreaInsets.bottom + (config?.tabBarHeight ?? 0)
        };
      }
      return {
        top: mode.top ?? 0,
        bottom: mode.bottom ?? 0,
        left: mode.left ?? 0,
        right: mode.right ?? 0
      };
    },
    [config?.tabBarHeight, safeAreaInsets]
  );

  const insets = resolveInsets(item.insets);
  const keyboardOffset =
    item.avoidKeyboard && keyboardHeight > 0 ? keyboardHeight : 0;

  const api: OverlayRenderApi = React.useMemo(() => ({
    id: item.id,
    hide: () => controller?.hide(item.id),
    insets
  }), [item.id, controller, insets]);

  return (
    <View
      pointerEvents={item.blockTouches ? "auto" : "box-none"}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        paddingTop: insets.top,
        paddingBottom: insets.bottom + keyboardOffset,
        paddingLeft: insets.left,
        paddingRight: insets.right
      }}
    >
      {item.render(api, item.props)}
    </View>
  );
});

export const OverlayHost = () => {
  const controller = React.useContext(OverlayContext);
  const items = React.useContext(OverlayItemsContext);
  const keyboardHeight = useKeyboardHeight();

  if (!controller || !items) {
    throw new Error("OverlayHost must be used within OverlayProvider");
  }

  const orderedItems = React.useMemo(() => sortByPriority(items), [items]);

  React.useEffect(() => {
    registerHost();
    return () => unregisterHost();
  }, []);

  React.useEffect(() => {
    if (orderedItems.length === 0) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        for (let i = orderedItems.length - 1; i >= 0; i -= 1) {
          const item = orderedItems[i];

          if (item.onBackPress && item.onBackPress()) {
            return true;
          }

          if (item.dismissible) {
            controller.hide(item.id);
            return true;
          }
        }

        return false;
      }
    );

    return () => {
      subscription.remove();
    };
  }, [controller, orderedItems]);

  return (
    <>
      {orderedItems.map((item) => (
        <OverlayWrapper key={item.id} item={item} keyboardHeight={keyboardHeight} />
      ))}
    </>
  );
};
