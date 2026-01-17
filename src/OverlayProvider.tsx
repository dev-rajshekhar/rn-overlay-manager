import * as React from "react";
import type {
  LoaderOptions,
  ModalOptions,
  OverlayController,
  OverlayItem,
  OverlayShowOptions,
  OverlayType,
  ToastOptions,
  TooltipOptions
} from "./types.js";
import { createOverlayStore } from "./store.js";
import { ModalOverlay } from "./overlays/ModalOverlay.js";
import { LoaderOverlay } from "./overlays/LoaderOverlay.js";
import { ToastOverlay } from "./overlays/ToastOverlay.js";

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
  const toastQueueRef = React.useRef<(ToastOptions & { id: string })[]>([]);
  const activeToastIdRef = React.useRef<string | null>(null);
  const toastIdRef = React.useRef(0);

  const show = React.useCallback(
    <P,>(options: OverlayShowOptions<P>) => store.show(options),
    [store]
  );

  const hide = React.useCallback((id: string) => store.hide(id), [store]);

  const hideAll = React.useCallback(
    (type?: OverlayType) => store.hideAll(type),
    [store]
  );

  const showToastNow = React.useCallback(
    (options: ToastOptions & { id: string }) => {
      const placement = options.placement ?? "bottom";
      const durationMs = options.durationMs ?? 2000;
      activeToastIdRef.current = options.id;
      return store.show({
        id: options.id,
        type: "toast",
        props: options,
        render: (api) => (
          <ToastOverlay
            message={options.message}
            placement={placement}
            durationMs={durationMs}
            onTimeout={() => store.hide(options.id)}
            toastStyle={options.toastStyle}
            textStyle={options.textStyle}
            backgroundColor={options.backgroundColor}
          >
            {options.render ? options.render(api, options) : null}
          </ToastOverlay>
        ),
        priority: 50,
        dismissible: false,
        blockTouches: false,
        backdrop: "none",
        placement,
        insets: "safeArea"
      });
    },
    [store]
  );

  const showNextToast = React.useCallback(() => {
    const next = toastQueueRef.current.shift();
    if (next) {
      showToastNow(next);
    }
  }, [showToastNow]);

  React.useEffect(() => {
    const activeId = activeToastIdRef.current;
    if (!activeId) {
      return;
    }
    const isActive = items.some((item) => item.id === activeId);
    if (!isActive) {
      activeToastIdRef.current = null;
      showNextToast();
    }
  }, [items, showNextToast]);

  const toast = React.useCallback(
    (options: ToastOptions) => {
      toastIdRef.current += 1;
      const id = `toast_${Date.now()}_${toastIdRef.current}`;
      const entry = { ...options, id };
      const queue = options.queue ?? true;

      if (activeToastIdRef.current) {
        if (queue) {
          toastQueueRef.current.push(entry);
          return id;
        }
        store.hide(activeToastIdRef.current);
      }

      return showToastNow(entry);
    },
    [showToastNow, store]
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
      const dismissible = options.dismissible ?? true;
      const backdrop = options.backdrop ?? "dim";
      const insets = options.insets ?? "safeArea";

      return store.show({
        type: "modal",
        props: options,
        render: (api) => (
          <ModalOverlay api={api} dismissible={dismissible} backdrop={backdrop}>
            {options.render(api)}
          </ModalOverlay>
        ),
        priority: 90,
        dismissible,
        blockTouches: true,
        backdrop,
        insets
      });
    },
    [store]
  );

  const loader = React.useCallback(
    (options?: LoaderOptions) => {
      return store.show({
        type: "loader",
        props: options,
        render: (api) =>
          options?.render ? (
            options.render(api)
          ) : (
            <LoaderOverlay message={options?.message} styles={options?.styles} />
          ),
        priority: 100,
        dismissible: false,
        blockTouches: true,
        backdrop: "dim",
        insets: "none"
      });
    },
    [store]
  );

  const controller = React.useMemo<OverlayController>(
    () => ({ show, hide, hideAll, toast, tooltip, modal, loader }),
    [show, hide, hideAll, toast, tooltip, modal, loader]
  );

  return (
    <OverlayContext.Provider value={controller}>
      <OverlayItemsContext.Provider value={items}>
        {children}
      </OverlayItemsContext.Provider>
    </OverlayContext.Provider>
  );
};
