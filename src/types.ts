import type * as React from "react";
import type { StyleProp, TextStyle, View, ViewStyle } from "react-native";

/**
 * Built-in overlay types shipped by this library.
 * "custom" is an escape hatch for anything (e.g. bottom sheets from any vendor).
 */
export type OverlayType = "modal" | "toast" | "tooltip" | "loader" | "custom";

/** Basic placement helpers for some overlay types */
export type OverlayPlacement = "top" | "center" | "bottom";

/** Optional: safe-area handling strategy. */
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

/** What the overlay render function receives. */
export type OverlayRenderApi = {
  /** Hide this overlay */
  hide: () => void;
  /** Overlay id */
  id: string;
  /** Safe-area insets (or fallback zeros) */
  insets?: Insets;
};

/** A single overlay instance in the stack. */
export type OverlayItem<P = unknown> = {
  /** Overlay id (generated if not provided). */
  id: string;
  /** Overlay type (used by hideAll and helpers). */
  type: OverlayType;
  createdAt: number;
  /** Optional group name (used by hideGroup). */
  group?: string;
  /** Scope for automatic cleanup when navigation changes. */
  scope?: "global" | "screen";
  /** Internal route key for screen-scoped overlays. */
  routeKey?: string;

  /** Higher priority renders above lower priority. */
  priority: number;

  /** Tap outside / back button can dismiss if true. */
  dismissible: boolean;

  /** Blocks touches behind the overlay (common for modal/loader). */
  blockTouches: boolean;

  /** Optional visual backdrop. */
  backdrop?: "none" | "transparent" | "dim";

  /** Common positioning hint. */
  placement?: OverlayPlacement;

  /** Insets strategy (optional). "safeArea+tabBar" uses OverlayProvider tabBarHeight. */
  insets?: InsetsMode;

  /** Shift overlay upward when keyboard is visible (opt-in). */
  avoidKeyboard?: boolean;

  /** Arbitrary user props for render function. */
  props: P;

  /** Render the overlay UI. */
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
  /** Optional custom id (otherwise generated). */
  id?: string;
};

/** Convenience toast options */
export type ToastOptions = {
  /** Toast message text. */
  message: string;
  /** Auto-dismiss delay in ms. */
  durationMs?: number;
  /** Toast placement within safe area. */
  placement?: "top" | "bottom";
  /** if true, enqueue when another toast is visible */
  queue?: boolean;
  /** Custom toast renderer (overrides built-in UI) */
  render?: (api: OverlayRenderApi, options: ToastOptions) => React.ReactNode;
  /** Style overrides for built-in toast UI */
  toastStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  scope?: "global" | "screen";
};

/** Convenience tooltip options */
export type TooltipAnchorRef = React.RefObject<{
  measureInWindow?: (
    callback: (x: number, y: number, width: number, height: number) => void
  ) => void;
} | null>;

export type TooltipOptions = {
  /** Anchor ref used for positioning (must be measurable). */
  anchorRef: TooltipAnchorRef;
  /** Tooltip text when using the built-in renderer. */
  text?: string;
  /** Preferred placement (auto picks top/bottom). */
  placement?: "top" | "bottom" | "left" | "right" | "auto";
  /** Built-in theme color. */
  type?: "info" | "success" | "warning" | "error";
  /** close on outside press */
  dismissible?: boolean;
  /** Auto-dismiss timeout in ms. */
  autoDismissMs?: number;
  /** Built-in style overrides. */
  styles?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
  };
  /** Custom renderer override. */
  render?: (api: OverlayRenderApi, data: TooltipOptions) => React.ReactNode;
  /** Shift tooltip upward when keyboard is visible (opt-in). */
  avoidKeyboard?: boolean;
  /** Scope for automatic cleanup when navigation changes. */
  scope?: "global" | "screen";
};

/** Convenience modal options */
export type ModalOptions = {
  /** Tap outside / back button can dismiss if true. */
  dismissible?: boolean;
  /** Backdrop appearance. */
  backdrop?: "transparent" | "dim";
  /** Insets strategy ("safeArea+tabBar" uses OverlayProvider tabBarHeight). */
  insets?: InsetsMode;
  /** Shift modal upward when keyboard is visible (opt-in). */
  avoidKeyboard?: boolean;
  /** Render modal content. */
  render: (api: OverlayRenderApi) => React.ReactNode;
  /** Scope for automatic cleanup when navigation changes. */
  scope?: "global" | "screen";
};

/** Convenience loader options */
export type LoaderOptions = {
  /** Optional message under the spinner. */
  message?: string;
  /** Custom renderer override. */
  render?: (api: OverlayRenderApi) => React.ReactNode;
  /** Style overrides for built-in loader. */
  styles?: {
    container?: StyleProp<ViewStyle>;
    text?: StyleProp<TextStyle>;
    spinner?: StyleProp<ViewStyle>;
  };
};

/** Public overlay controller API */
export interface OverlayController {
  /**
   * Show a custom overlay and return its id.
   * @example overlay.show({ type: "custom", render: () => <MyOverlay /> })
   */
  show<P = unknown>(options: OverlayShowOptions<P>): string;
  /** Hide an overlay by id. */
  hide(id: string): void;
  /** Hide all overlays (or only by type). */
  hideAll(type?: OverlayType): void;
  /** Hide all overlays in a group. */
  hideGroup(group: string): void;

  /** convenience helpers */
  /**
   * Show a toast. Queues by default when another toast is visible.
   * @example overlay.toast({ message: "Saved", placement: "bottom" })
   */
  toast(options: ToastOptions): string;
  /**
   * Show a tooltip anchored to a measurable ref.
   * @example overlay.tooltip({ anchorRef, text: "Tip", placement: "auto" })
   */
  tooltip(options: TooltipOptions): string;
  /**
   * Show a modal with a render override.
   * @example overlay.modal({ render: (api) => <MyModal onClose={api.hide} /> })
   */
  modal(options: ModalOptions): string;
  /**
   * Show a blocking loader. Close via hide(id).
   * @example const id = overlay.loader({ message: "Loading..." })
   */
  loader(options?: LoaderOptions): string;
}
