import type * as React from "react";
import type { StyleProp, TextStyle, View, ViewStyle } from "react-native";

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

export type Insets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

/** What the overlay render function receives */
export type OverlayRenderApi = {
  /** Hide this overlay */
  hide: () => void;
  /** Overlay id */
  id: string;
  /** Safe-area insets (or fallback zeros) */
  insets?: Insets;
};

/** A single overlay instance in the stack */
export type OverlayItem<P = unknown> = {
  id: string;
  type: OverlayType;
  createdAt: number;
  group?: string;

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

  /** Shift overlay upward when keyboard is visible */
  avoidKeyboard?: boolean;

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
  /** Custom toast renderer (overrides built-in UI) */
  render?: (api: OverlayRenderApi, options: ToastOptions) => React.ReactNode;
  /** Style overrides for built-in toast UI */
  toastStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
};

/** Convenience tooltip options */
export type TooltipAnchorRef = React.RefObject<{
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
} | null>;

export type TooltipOptions = {
  anchorRef: TooltipAnchorRef;
  text?: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  type?: "info" | "success" | "warning" | "error";
  /** close on outside press */
  dismissible?: boolean;
  autoDismissMs?: number;
  styles?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
  render?: (api: OverlayRenderApi, data: TooltipOptions) => React.ReactNode;
  avoidKeyboard?: boolean;
};

/** Convenience modal options */
export type ModalOptions = {
  dismissible?: boolean;
  backdrop?: "transparent" | "dim";
  insets?: InsetsMode;
  avoidKeyboard?: boolean;
  render: (api: OverlayRenderApi) => React.ReactNode;
};

/** Convenience loader options */
export type LoaderOptions = {
  message?: string;
  render?: (api: OverlayRenderApi) => React.ReactNode;
  styles?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
    spinner?: StyleProp<ViewStyle>;
  };
};

/** Public overlay controller API */
export interface OverlayController {
  show<P = unknown>(options: OverlayShowOptions<P>): string;
  hide(id: string): void;
  hideAll(type?: OverlayType): void;
  hideGroup(group: string): void;

  /** convenience helpers */
  toast(options: ToastOptions): string;
  tooltip(options: TooltipOptions): string;
  modal(options: ModalOptions): string;
  loader(options?: LoaderOptions): string;
}
