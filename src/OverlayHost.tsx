import * as React from "react";
import { BackHandler, View } from "react-native";
import type { Insets, InsetsMode, OverlayItem, OverlayRenderApi } from "./types.js";
import { useOptionalSafeAreaInsets } from "./insets.js";
import { OverlayContext, OverlayItemsContext } from "./OverlayProvider.js";

const sortByPriority = (items: OverlayItem[]): OverlayItem[] => {
  return items
    .slice()
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
};

export const OverlayHost = () => {
  const controller = React.useContext(OverlayContext);
  const items = React.useContext(OverlayItemsContext);
  const safeAreaInsets = useOptionalSafeAreaInsets();

  if (!controller || !items) {
    throw new Error("OverlayHost must be used within OverlayProvider");
  }

  const orderedItems = React.useMemo(() => sortByPriority(items), [items]);

  const resolveInsets = React.useCallback(
    (mode: InsetsMode | undefined): Insets => {
      if (!mode || mode === "none") {
        return { top: 0, bottom: 0, left: 0, right: 0 };
      }
      if (mode === "safeArea" || mode === "safeArea+tabBar") {
        // TODO: add tab bar offset for safeArea+tabBar mode.
        return safeAreaInsets;
      }
      return {
        top: mode.top ?? 0,
        bottom: mode.bottom ?? 0,
        left: mode.left ?? 0,
        right: mode.right ?? 0
      };
    },
    [safeAreaInsets]
  );

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
      {orderedItems.map((item) => {
        const insets = resolveInsets(item.insets);
        const api: OverlayRenderApi = {
          id: item.id,
          hide: () => controller.hide(item.id),
          insets
        };

        return (
          <View
            key={item.id}
            pointerEvents={item.blockTouches ? "auto" : "box-none"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
              paddingLeft: insets.left,
              paddingRight: insets.right
            }}
          >
            {item.render(api, item.props)}
          </View>
        );
      })}
    </>
  );
};
