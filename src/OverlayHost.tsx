import * as React from "react";
import { View } from "react-native";
import type { OverlayItem, OverlayRenderApi } from "./types.js";
import { OverlayContext, OverlayItemsContext } from "./OverlayProvider.js";

const sortByPriority = (items: OverlayItem[]): OverlayItem[] => {
  return items
    .slice()
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
};

export const OverlayHost = () => {
  const controller = React.useContext(OverlayContext);
  const items = React.useContext(OverlayItemsContext);

  if (!controller || !items) {
    throw new Error("OverlayHost must be used within OverlayProvider");
  }

  const orderedItems = React.useMemo(() => sortByPriority(items), [items]);

  return (
    <>
      {orderedItems.map((item) => {
        const api: OverlayRenderApi = {
          id: item.id,
          hide: () => controller.hide(item.id)
        };

        return (
          <View
            key={item.id}
            pointerEvents={item.blockTouches ? "auto" : "box-none"}
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
          >
            {item.render(api, item.props)}
          </View>
        );
      })}
    </>
  );
};
