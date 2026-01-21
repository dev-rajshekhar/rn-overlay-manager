const warned = new Set<string>();

const warnOnce = (key: string, message: string) => {
  if (!__DEV__ || warned.has(key)) {
    return;
  }
  warned.add(key);
  // eslint-disable-next-line no-console
  console.warn(message);
};

let hostCount = 0;

export const registerHost = () => {
  if (!__DEV__) {
    return;
  }
  hostCount += 1;
  if (hostCount > 1) {
    warnOnce(
      "multiple-hosts",
      "[rn-overlay-manager] Multiple OverlayHost instances detected. Mount <OverlayHost /> once near the root."
    );
  }
};

export const unregisterHost = () => {
  if (!__DEV__) {
    return;
  }
  hostCount = Math.max(0, hostCount - 1);
};

export const warnIfNoHost = () => {
  if (!__DEV__ || hostCount > 0) {
    return;
  }
  warnOnce(
    "no-host",
    "[rn-overlay-manager] OverlayHost is not mounted. Mount <OverlayHost /> once near the root."
  );
};

export const warnTooltipAnchorInvalid = () => {
  warnOnce(
    "tooltip-anchor-invalid",
    "[rn-overlay-manager] Tooltip anchorRef is invalid or not measurable."
  );
};

export const warnScreenScopeWithoutNavigation = () => {
  warnOnce(
    "screen-scope-without-navigation",
    "[rn-overlay-manager] scope=\"screen\" requires NavigationOverlayProvider; falling back to global scope."
  );
};
