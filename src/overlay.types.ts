export enum OverlayType {
  Modal = "modal",
  Toast = "toast",
  Tooltip = "tooltip",
  Loader = "loader",
  Custom = "custom"
}

export type OverlayKind = OverlayType | (string & {});

export type OverlayId = string;

export type OverlayRender = () => unknown;

export interface OverlayItem {
  id: OverlayId;
  type: OverlayKind;
  render: OverlayRender;
  priority?: number;
  dismissible?: boolean;
  data?: unknown;
}

export interface OverlayShowOptions {
  id?: OverlayId;
  type: OverlayKind;
  render: OverlayRender;
  priority?: number;
  dismissible?: boolean;
  data?: unknown;
  timeoutMs?: number;
}

export interface ToastOptions extends Omit<OverlayShowOptions, "type"> {
  type?: OverlayType.Toast;
}

export interface TooltipOptions extends Omit<OverlayShowOptions, "type"> {
  type?: OverlayType.Tooltip;
}

export interface ModalOptions extends Omit<OverlayShowOptions, "type"> {
  type?: OverlayType.Modal;
}
