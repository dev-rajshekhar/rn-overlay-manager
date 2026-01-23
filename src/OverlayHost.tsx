import * as React from "react";
import { BackHandler, View } from "react-native";
import type { Insets, InsetsMode, OverlayItem, OverlayRenderApi } from "./types.js";
import { useOptionalSafeAreaInsets } from "./insets.js";
import { useKeyboardHeight } from "./keyboard.js";
import { registerHost, unregisterHost } from "./devWarnings.js";
import { AnimatedOverlayContainer } from "./animations/AnimatedOverlayContainer.js";
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

const OverlayWrapper = React.memo(
  ({
    item,
    keyboardHeight,
    visible,
    stackIndex,
    stackSize,
    onExited
  }: {
    item: OverlayItem;
    keyboardHeight: number;
    visible: boolean;
    stackIndex?: number;
    stackSize?: number;
    onExited?: () => void;
  }) => {
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
    <AnimatedOverlayContainer
      visible={visible}
      animation={item.animation}
      durationMs={item.animationDurationMs}
      easing={item.animationEasing}
      stackIndex={stackIndex}
      stackSize={stackSize}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
      onExited={onExited}
    >
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
    </AnimatedOverlayContainer>
  );
});

export const OverlayHost = () => {
  const controller = React.useContext(OverlayContext);
  const items = React.useContext(OverlayItemsContext);
  const keyboardHeight = useKeyboardHeight();

  if (!controller || !items) {
    throw new Error("OverlayHost must be used within OverlayProvider");
  }

  const [presentItems, setPresentItems] = React.useState<
    Record<string, { item: OverlayItem; visible: boolean }>
  >({});

  React.useEffect(() => {
    setPresentItems((prev) => {
      const next: Record<string, { item: OverlayItem; visible: boolean }> = {
        ...prev
      };
      const activeIds = new Set(items.map((item) => item.id));

      items.forEach((item) => {
        next[item.id] = { item, visible: true };
      });

      Object.keys(prev).forEach((id) => {
        if (activeIds.has(id)) {
          return;
        }
        const previous = prev[id];
        const animation = previous.item.animation ?? "none";
        const animatePresence = previous.item.animatePresence ?? true;
        if (!animatePresence || animation === "none") {
          delete next[id];
          return;
        }
        if (previous.visible) {
          next[id] = { item: previous.item, visible: false };
          return;
        }
        next[id] = previous;
      });

      return next;
    });
  }, [items]);

  const activeOrderedItems = React.useMemo(() => sortByPriority(items), [items]);
  const orderedItems = React.useMemo(() => {
    const list = Object.values(presentItems).map((entry) => entry.item);
    return sortByPriority(list);
  }, [presentItems]);

  React.useEffect(() => {
    registerHost();
    return () => unregisterHost();
  }, []);

  React.useEffect(() => {
    if (activeOrderedItems.length === 0) {
      return;
    }

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        for (let i = activeOrderedItems.length - 1; i >= 0; i -= 1) {
          const item = activeOrderedItems[i];

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
  }, [controller, activeOrderedItems]);

  return (
    <>
      {orderedItems.map((item, index) => {
        const entry = presentItems[item.id];
        if (!entry) {
          return null;
        }
        return (
          <OverlayWrapper
            key={item.id}
            item={entry.item}
            keyboardHeight={keyboardHeight}
            visible={entry.visible}
            stackIndex={index}
            stackSize={orderedItems.length}
            onExited={() => {
              setPresentItems((prev) => {
                const next = { ...prev };
                delete next[item.id];
                return next;
              });
            }}
          />
        );
      })}
    </>
  );
};
