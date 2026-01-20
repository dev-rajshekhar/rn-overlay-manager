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
import { warnIfNoHost } from "./devWarnings.js";
import { ModalOverlay } from "./overlays/ModalOverlay.js";
import { LoaderOverlay } from "./overlays/LoaderOverlay.js";
import { TooltipOverlay } from "./overlays/TooltipOverlay.js";
import { ToastOverlay } from "./overlays/ToastOverlay.js";
import { NavigationOverlayContext } from "./navigation/context.js";
import { warnScreenScopeWithoutNavigation } from "./devWarnings.js";

export const OverlayContext = React.createContext<OverlayController | null>(
  null
);
export const OverlayItemsContext = React.createContext<OverlayItem[] | null>(
  null
);
export const OverlayConfigContext = React.createContext({
  tabBarHeight: 0
});

export type OverlayProviderProps = {
  children?: React.ReactNode;
  tabBarHeight?: number;
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
    avoidKeyboard: overrides?.avoidKeyboard,
    scope: overrides?.scope,
    props,
    onBackPress: overrides?.onBackPress,
    group: overrides?.group
  };
};

export const OverlayProvider = ({
  children,
  tabBarHeight = 0
}: OverlayProviderProps) => {
  const [items, setItems] = React.useState<OverlayItem[]>([]);
  const navigationContext = React.useContext(NavigationOverlayContext);
  const store = React.useMemo(() => createOverlayStore(setItems), [setItems]);
  const toastQueueRef = React.useRef<(ToastOptions & { id: string })[]>([]);
  const activeToastIdRef = React.useRef<string | null>(null);
  const toastIdRef = React.useRef(0);
  const routeKey = navigationContext?.routeKey ?? null;

  const show = React.useCallback(
    <P,>(options: OverlayShowOptions<P>) => {
      warnIfNoHost();
      const scope = options.scope ?? "global";
      if (scope === "screen" && !routeKey) {
        warnScreenScopeWithoutNavigation();
      }
      return store.show({
        ...options,
        scope: scope === "screen" && !routeKey ? "global" : scope,
        routeKey: scope === "screen" ? routeKey ?? undefined : undefined
      });
    },
    [routeKey, store]
  );

  const hide = React.useCallback((id: string) => store.hide(id), [store]);

  const hideAll = React.useCallback(
    (type?: OverlayType) => store.hideAll(type),
    [store]
  );

  const hideGroup = React.useCallback(
    (group: string) => store.hideGroup(group),
    [store]
  );

  const showToastNow = React.useCallback(
    (options: ToastOptions & { id: string }) => {
      warnIfNoHost();
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
      warnIfNoHost();
      const dismissible = options.dismissible ?? true;
      const placement = options.placement ?? "auto";
      const type = options.type ?? "info";
      const scope = options.scope ?? "global";
      if (scope === "screen" && !routeKey) {
        warnScreenScopeWithoutNavigation();
      }

      return store.show({
        type: "tooltip",
        props: options,
        render: (api) => (
          <TooltipOverlay
            api={api}
            options={{
              ...options,
              placement,
              type,
              dismissible
            }}
          />
        ),
        priority: 70,
        dismissible,
        blockTouches: false,
        backdrop: "transparent",
        insets: "none",
        avoidKeyboard: options.avoidKeyboard,
        scope: scope === "screen" && !routeKey ? "global" : scope,
        routeKey: scope === "screen" ? routeKey ?? undefined : undefined
      });
    },
    [routeKey, store]
  );

  const modal = React.useCallback(
    (options: ModalOptions) => {
      warnIfNoHost();
      const dismissible = options.dismissible ?? true;
      const backdrop = options.backdrop ?? "dim";
      const insets = options.insets ?? "safeArea";
      const scope = options.scope ?? "global";
      if (scope === "screen" && !routeKey) {
        warnScreenScopeWithoutNavigation();
      }

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
        insets,
        avoidKeyboard: options.avoidKeyboard,
        scope: scope === "screen" && !routeKey ? "global" : scope,
        routeKey: scope === "screen" ? routeKey ?? undefined : undefined
      });
    },
    [routeKey, store]
  );

  const loader = React.useCallback(
    (options?: LoaderOptions) => {
      warnIfNoHost();
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

  React.useEffect(() => {
    if (!routeKey) {
      return;
    }
    store.hideScreenScopedExcept(routeKey);
  }, [routeKey, store]);

  const controller = React.useMemo<OverlayController>(
    () => ({ show, hide, hideAll, hideGroup, toast, tooltip, modal, loader }),
    [show, hide, hideAll, hideGroup, toast, tooltip, modal, loader]
  );

  return (
    <OverlayContext.Provider value={controller}>
      <OverlayConfigContext.Provider value={{ tabBarHeight }}>
        <OverlayItemsContext.Provider value={items}>
          {children}
        </OverlayItemsContext.Provider>
      </OverlayConfigContext.Provider>
    </OverlayContext.Provider>
  );
};
