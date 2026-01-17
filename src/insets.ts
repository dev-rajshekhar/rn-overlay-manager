export type Insets = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

declare const require: (id: string) => unknown;

const ZERO_INSETS: Insets = { top: 0, bottom: 0, left: 0, right: 0 };

type UseSafeAreaInsets = () => Insets;

let cachedHook: UseSafeAreaInsets | null | undefined;

const loadSafeAreaHook = (): UseSafeAreaInsets | null => {
  if (cachedHook !== undefined) {
    return cachedHook;
  }

  try {
    const module = require("react-native-safe-area-context") as {
      useSafeAreaInsets?: UseSafeAreaInsets;
      default?: { useSafeAreaInsets?: UseSafeAreaInsets };
    };
    const hook = module?.useSafeAreaInsets ?? module?.default?.useSafeAreaInsets;
    cachedHook = typeof hook === "function" ? hook : null;
  } catch {
    cachedHook = null;
  }

  return cachedHook;
};

export const useOptionalSafeAreaInsets = (): Insets => {
  const hook = loadSafeAreaHook();
  if (!hook) {
    return ZERO_INSETS;
  }
  return hook();
};
