import type { Dispatch, SetStateAction } from "react";
import type {
  OverlayItem,
  OverlayShowOptions,
  OverlayType
} from "./types.js";

export type OverlayStore = {
  show: <P = unknown>(options: OverlayShowOptions<P>) => string;
  hide: (id: string) => void;
  hideAll: (type?: OverlayType) => void;
};

type SetItems = Dispatch<SetStateAction<OverlayItem[]>>;

const sortByPriority = (items: OverlayItem[]): OverlayItem[] => {
  return items
    .slice()
    .sort((a, b) => b.priority - a.priority || a.createdAt - b.createdAt);
};

export const createOverlayStore = (setItems: SetItems): OverlayStore => {
  let idCounter = 0;

  const generateId = (): string => {
    idCounter += 1;
    return `overlay_${Date.now()}_${idCounter}`;
  };

  const show = <P,>(options: OverlayShowOptions<P>): string => {
    const id = options.id ?? generateId();

    const item: OverlayItem<P> = {
      id,
      type: options.type,
      createdAt: Date.now(),
      priority: options.priority ?? 0,
      dismissible: options.dismissible ?? true,
      blockTouches: options.blockTouches ?? false,
      backdrop: options.backdrop,
      placement: options.placement,
      insets: options.insets,
      props: options.props as P,
      render: options.render,
      onBackPress: options.onBackPress
    };

    setItems((prev) => sortByPriority([...prev, item as OverlayItem]));
    return id;
  };

  const hide = (id: string): void => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) {
        return prev;
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const hideAll = (type?: OverlayType): void => {
    setItems((prev) => {
      return prev.filter((item) => {
        if (type && item.type !== type) {
          return true;
        }
        return false;
      });
    });
  };

  return { show, hide, hideAll };
};
