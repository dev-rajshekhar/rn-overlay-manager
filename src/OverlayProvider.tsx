import * as React from "react";
import type {
  ModalOptions,
  OverlayController,
  OverlayItem,
  OverlayShowOptions,
  OverlayType,
  ToastOptions,
  TooltipOptions,
} from "./types.js";
import { createOverlayStore } from "./store.js";

export const OverlayContext = React.createContext<OverlayController | null>(
  null
);
export const OverlayItemsContext = React.createContext<OverlayItem[] | null>(
  null
);

export type OverlayProviderProps = {
  children?: React.ReactNode;
};

const createHelperShowOptions = <P,>(
  type: OverlayType,
  props: P,
  render: OverlayShowOptions<P>["render"],
  overrides?: Partial<OverlayShowOptions<P>>
): OverlayShowOptions<P> => {
  return {
    id: overrides?.id,
    type,
    render,
    priority: overrides?.priority ?? 0,
    dismissible: overrides?.dismissible ?? true,
    blockTouches: overrides?.blockTouches ?? false,
    backdrop: overrides?.backdrop,
    placement: overrides?.placement,
    insets: overrides?.insets,
    props,
    onBackPress: overrides?.onBackPress,
  };
};

export const OverlayProvider = ({ children }: OverlayProviderProps) => {
  const [items, setItems] = React.useState<OverlayItem[]>([]);
  const store = React.useMemo(() => createOverlayStore(setItems), [setItems]);

  const show = React.useCallback(
    <P,>(options: OverlayShowOptions<P>) => store.show(options),
    [store]
  );

  const hide = React.useCallback((id: string) => store.hide(id), [store]);

  const hideAll = React.useCallback(
    (type?: OverlayType) => store.hideAll(type),
    [store]
  );

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const showOptions = createHelperShowOptions(
        "toast",
        options,
        (_api, _props) => null
      );
      return store.show(showOptions);
    },
    [store]
  );

  const tooltip = React.useCallback(
    (options: TooltipOptions) => {
      const showOptions = createHelperShowOptions(
        "tooltip",
        options,
        (_api, _props) => null
      );
      return store.show(showOptions);
    },
    [store]
  );

  const modal = React.useCallback(
    (options: ModalOptions) => {
      const showOptions = createHelperShowOptions(
        "modal",
        options,
        (api, _props) => options.render(api),
        {
          dismissible: options.dismissible,
          backdrop: options.backdrop,
        }
      );
      return store.show(showOptions);
    },
    [store]
  );

  const controller = React.useMemo<OverlayController>(
    () => ({ show, hide, hideAll, toast, tooltip, modal }),
    [show, hide, hideAll, toast, tooltip, modal]
  );

  return (
    <OverlayContext.Provider value={controller}>
      <OverlayItemsContext.Provider value={items}>
        {children}
      </OverlayItemsContext.Provider>
    </OverlayContext.Provider>
  );
};
