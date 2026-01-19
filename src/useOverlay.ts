import * as React from "react";
import type { OverlayController } from "./types.js";
import { OverlayContext } from "./OverlayProvider.js";

/**
 * Access the overlay controller from context.
 * Must be used within OverlayProvider.
 */
export const useOverlay = (): OverlayController => {
  const context = React.useContext(OverlayContext);
  if (!context) {
    throw new Error("useOverlay must be used within OverlayProvider");
  }
  return context;
};
