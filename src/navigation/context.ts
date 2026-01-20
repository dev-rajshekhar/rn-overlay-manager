import * as React from "react";

export type NavigationOverlayContextValue = {
  routeKey?: string | null;
  tabBarHeight: number;
  setTabBarHeight: (height: number) => void;
};

export const NavigationOverlayContext =
  React.createContext<NavigationOverlayContextValue>({
    tabBarHeight: 0,
    setTabBarHeight: () => {}
  });
