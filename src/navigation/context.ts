import * as React from "react";

export type NavigationOverlayContextValue = {
  routeKey?: string | null;
};

export const NavigationOverlayContext =
  React.createContext<NavigationOverlayContextValue>({});
