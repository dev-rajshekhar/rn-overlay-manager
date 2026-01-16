import type * as React from "react";
import type { View } from "react-native";

/**
 * Built-in overlay types shipped by this library.
 * "custom" is an escape hatch for anything (e.g. bottom sheets from any vendor).
 */
export type OverlayType = "modal" | "toast" | "tooltip" | "loader" | "custom";

/** Basic placement helpers for some overlay types */
export type OverlayPlacement = "top" | "center" | "bottom";

/** Optional: safe-area handling strategy (implementation comes later) */
export type InsetsMode =
  | "none"
  | "safeArea"
  | "safeArea+tabBar"
  | { top?: number; bottom?: number; left?: number; right?: number };

/** What the overlay render function receives */
export type OverlayRenderApi = {
  /** Hide this overlay */
  hide: () => void;
  /** Overlay id */
  id: string;
};

/** A single overlay instance in the stack */
export type OverlayItem<P = unknown> = {
  id: string;
  type: OverlayType;
  createdAt: number;

  /** Higher priority renders above lower priority */
  priority: number;

  /** Tap outside / back button can dismiss if true */
  dismissible: boolean;

  /** Blocks touches behind the overlay (common for modal/loader) */
  blockTouches: boolean;

  /** Optional visual backdrop */
  backdrop?: "none" | "transparent" | "dim";

  /** Common positioning hint */
  placement?: OverlayPlacement;

  /** Insets strategy (optional) */
  insets?: InsetsMode;

  /** Arbitrary user props for render function */
  props: P;

  /** Render the overlay UI */
  render: (api: OverlayRenderApi, props: P) => React.ReactNode;

  /**
   * Optional back handler hook for this overlay.
   * Return true if the back press was handled.
   */
  onBackPress?: () => boolean;
};

/** Options passed to show() */
export type OverlayShowOptions<P = unknown> = Omit<
  OverlayItem<P>,
  "id" | "createdAt"
> & {
  id?: string;
};

/** Convenience toast options */
export type ToastOptions = {
  message: string;
  durationMs?: number;
  placement?: "top" | "bottom";
  /** if true, enqueue when another toast is visible */
  queue?: boolean;
};

/** Convenience tooltip options */
export type TooltipOptions = {
  anchorRef: React.RefObject<View>;
  text: string;
  placement?: "top" | "bottom";
  /** close on outside press */
  dismissible?: boolean;
};

/** Convenience modal options */
export type ModalOptions = {
  dismissible?: boolean;
  backdrop?: "transparent" | "dim";
  render: (api: OverlayRenderApi) => React.ReactNode;
};

/** Public overlay controller API */
export interface OverlayController {
  show<P = unknown>(options: OverlayShowOptions<P>): string;
  hide(id: string): void;
  hideAll(type?: OverlayType): void;

  /** convenience helpers */
  toast(options: ToastOptions): string;
  tooltip(options: TooltipOptions): string;
  modal(options: ModalOptions): string;
}
