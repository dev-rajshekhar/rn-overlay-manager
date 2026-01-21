import * as React from "react";
import type { OverlayProviderProps } from "../OverlayProvider.js";
import { OverlayProvider } from "../OverlayProvider.js";
import { NavigationOverlayContext } from "./context.js";

export type NavigationContainerRefLike = {
  addListener?: (event: "state", callback: () => void) => any;
  getCurrentRoute?: () => { key?: string; name?: string } | undefined;
};

export type NavigationOverlayProviderProps = OverlayProviderProps & {
  /** Optional navigation ref (useNavigationContainerRef()) */
  navigationRef?: React.RefObject<NavigationContainerRefLike | null>;
  /** Optional handler for navigation state changes */
  onStateChange?: () => void;
  /** Optional tab bar height override */
  tabBarHeight?: number;
};

export const NavigationOverlayProvider = ({
  children,
  navigationRef,
  onStateChange,
  tabBarHeight,
  ...providerProps
}: NavigationOverlayProviderProps) => {
  const [routeKey, setRouteKey] = React.useState<string | null>(null);
  const [internalTabBarHeight, setInternalTabBarHeight] = React.useState(0);

  const setTabBarHeight = React.useCallback((height: number) => {
    setInternalTabBarHeight(height);
  }, []);

  const updateRouteKey = React.useCallback(() => {
    const route = navigationRef?.current?.getCurrentRoute?.();
    setRouteKey(route?.key ?? route?.name ?? null);
  }, [navigationRef]);

  React.useEffect(() => {
    const ref = navigationRef?.current;
    if (!ref?.addListener) {
      updateRouteKey();
      return;
    }

    const subscription = ref.addListener("state", () => {
      updateRouteKey();
      onStateChange?.();
    });

    return () => {
      if (typeof subscription === "function") {
        subscription();
      } else if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, [navigationRef, onStateChange, updateRouteKey]);

  React.useEffect(() => {
    updateRouteKey();
  }, [updateRouteKey]);

  return (
    <NavigationOverlayContext.Provider
      value={{
        routeKey,
        tabBarHeight: tabBarHeight ?? internalTabBarHeight,
        setTabBarHeight
      }}
    >
      <OverlayProvider
        {...providerProps}
        tabBarHeight={tabBarHeight ?? internalTabBarHeight}
      >
        {children}
      </OverlayProvider>
    </NavigationOverlayContext.Provider>
  );
};
