import * as React from "react";
import type { OverlayProviderProps } from "../OverlayProvider.js";
import { OverlayProvider } from "../OverlayProvider.js";

export type NavigationContainerRefLike = {
  addListener?: (event: "state", callback: () => void) => { remove: () => void };
};

export type NavigationOverlayProviderProps = OverlayProviderProps & {
  /** Optional navigation ref (useNavigationContainerRef()) */
  navigationRef?: React.RefObject<NavigationContainerRefLike | null>;
  /** Optional handler for navigation state changes */
  onStateChange?: () => void;
};

type NavigationOverlayContextValue = {
  navigationRef?: React.RefObject<NavigationContainerRefLike | null>;
};

export const NavigationOverlayContext =
  React.createContext<NavigationOverlayContextValue>({});

export const NavigationOverlayProvider = ({
  children,
  navigationRef,
  onStateChange,
  ...providerProps
}: NavigationOverlayProviderProps) => {
  React.useEffect(() => {
    const ref = navigationRef?.current;
    if (!ref?.addListener) {
      return;
    }

    const subscription = ref.addListener("state", () => {
      onStateChange?.();
    });

    return () => subscription?.remove?.();
  }, [navigationRef, onStateChange]);

  return (
    <NavigationOverlayContext.Provider value={{ navigationRef }}>
      <OverlayProvider {...providerProps}>{children}</OverlayProvider>
    </NavigationOverlayContext.Provider>
  );
};
