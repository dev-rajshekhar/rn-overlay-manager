import type {
  ModalOptions,
  OverlayId,
  OverlayKind,
  OverlayShowOptions,
  ToastOptions,
  TooltipOptions
} from "./overlay.types.js";

export interface OverlayController {
  show(options: OverlayShowOptions): OverlayId;
  hide(id: OverlayId): void;
  hideAll(type?: OverlayKind): void;
  toast(options: ToastOptions): OverlayId;
  tooltip(options: TooltipOptions): OverlayId;
  modal(options: ModalOptions): OverlayId;
}

export type OverlayAPI = OverlayController;
