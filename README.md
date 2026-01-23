# rn-overlay-manager

[![npm version](https://img.shields.io/npm/v/rn-overlay-manager.svg)](https://www.npmjs.com/package/rn-overlay-manager)
[![npm downloads](https://img.shields.io/npm/dm/rn-overlay-manager.svg)](https://www.npmjs.com/package/rn-overlay-manager)

Overlay manager for React Native. Show modals, toasts, tooltips, and loaders from anywhere via a simple hook.

## Installation

```sh
npm install rn-overlay-manager
```

```sh
yarn add rn-overlay-manager
```

Safe-area support requires `react-native-safe-area-context`:

```sh
npm install react-native-safe-area-context
```

## Setup

```tsx
import { OverlayHost, OverlayProvider } from "rn-overlay-manager";

export default function App() {
  return (
    <OverlayProvider tabBarHeight={0}>
      {/* app content */}
      <OverlayHost />
    </OverlayProvider>
  );
}
```

## Using with React Navigation

```tsx
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import {
  NavigationOverlayProvider,
  NavigationOverlayHost,
} from "rn-overlay-manager";

export default function App() {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationOverlayProvider navigationRef={navigationRef}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
      <NavigationOverlayHost />
    </NavigationOverlayProvider>
  );
}
```

Notes:

- Mount the host once near the root.
- Overlays are global by default.
- Use `scope: "screen"` to auto-clear overlays when the route changes (requires NavigationOverlayProvider).
- `tabBarHeight` can be passed directly or updated via `useNavigationOverlayConfig`.

## Usage

## Demo

![rn-overlay-manager](https://github.com/user-attachments/assets/c7c2c433-d330-4c57-adb7-9b7835f78a0a)

### Toast

```tsx
const overlay = useOverlay();

overlay.toast({ message: "Saved", placement: "bottom" });
overlay.toast({
  message: "Queued",
  queue: true,
});
overlay.toast({
  message: "Styled",
  backgroundColor: "#2563EB",
  textStyle: { fontWeight: "700" },
  toastStyle: { borderRadius: 12 },
});
```

### Modal

```tsx
overlay.modal({
  dismissible: true,
  backdrop: "dim",
  render: (api) => (
    <View>
      <Text>Confirm?</Text>
      <Button title="Close" onPress={api.hide} />
    </View>
  ),
});
```

### Loader

```tsx
const id = overlay.loader({ message: "Loading..." });
overlay.hide(id);
```

### Tooltip

```tsx
const anchorRef = React.useRef(null);

overlay.tooltip({
  anchorRef: anchorRef as unknown as TooltipAnchorRef,
  text: "Helpful tip",
  placement: "auto",
});
```

Tooltips clamp to the screen and safe-area bounds and auto-place above/below when `placement="auto"`.

### Custom overlays

```tsx
const id = overlay.show({
  type: "custom",
  render: (api) => <MyOverlay onClose={api.hide} />,
  dismissible: true,
  blockTouches: true,
  backdrop: "dim",
  priority: 10,
});

overlay.hide(id);
```

## API reference

| Method             | Description                            | Returns |
| ------------------ | -------------------------------------- | ------- |
| `toast(options)`   | Show a toast notification.             | `id`    |
| `modal(options)`   | Show a modal with a render override.   | `id`    |
| `loader(options?)` | Show a blocking loader.                | `id`    |
| `tooltip(options)` | Show a tooltip anchored to a ref.      | `id`    |
| `show(options)`    | Show a custom overlay.                 | `id`    |
| `hide(id)`         | Hide an overlay by id.                 | `void`  |
| `hideAll(type?)`   | Hide all overlays, optionally by type. | `void`  |
| `hideGroup(group)` | Hide all overlays in a group.          | `void`  |

## Options by helper

### toast(options)

| Option            | Type                          | Default    | Notes                                |
| ----------------- | ----------------------------- | ---------- | ------------------------------------ |
| `message`         | `string`                      | required   | Text to display.                     |
| `durationMs`      | `number`                      | `2000`     | Auto-dismiss delay.                  |
| `placement`       | `"top" \| "bottom"`           | `"bottom"` | Position within safe area.           |
| `queue`           | `boolean`                     | `true`     | Queue when another toast is visible. |
| `render`          | `(api, options) => ReactNode` | —          | Full custom renderer.                |
| `toastStyle`      | `ViewStyle`                   | —          | Built-in toast container style.      |
| `textStyle`       | `TextStyle`                   | —          | Built-in toast text style.           |
| `backgroundColor` | `string`                      | —          | Built-in toast background.           |
| `animation`       | `"none" \| "fade" \| "scale" \| "slide-up" \| "slide-down"` | `"slide-up"` | Enter/exit animation preset. |
| `animationDurationMs` | `number`                  | `180`      | Animation duration in ms.            |
| `animationEasing` | `"default" \| "linear"`       | `"default"`| Animation easing preset.             |
| `animatePresence` | `boolean`                     | `true`     | Keep mounted for exit animation.     |
| `onShow`          | `() => void`                  | —          | Called when toast becomes visible.   |
| `onHide`          | `() => void`                  | —          | Called when hide starts.             |
| `onHidden`        | `() => void`                  | —          | Called after toast unmounts.         |

### modal(options)

| Option          | Type                            | Default      | Notes                               |
| --------------- | ------------------------------- | ------------ | ----------------------------------- |
| `render`        | `(api) => ReactNode`            | required     | Render modal content.               |
| `dismissible`   | `boolean`                       | `true`       | Back button / backdrop dismissal.   |
| `backdrop`      | `"transparent" \| "dim"`        | `"dim"`      | Backdrop appearance.                |
| `insets`        | `"safeArea" \| "none" \| {...}` | `"safeArea"` | Container padding strategy.         |
| `avoidKeyboard` | `boolean`                       | `false`      | Shift upward when keyboard appears. |
| `animation`     | `"none" \| "fade" \| "scale" \| "slide-up" \| "slide-down"` | `"scale"` | Enter/exit animation preset. |
| `animationDurationMs` | `number`                   | `180`        | Animation duration in ms.           |
| `animationEasing` | `"default" \| "linear"`        | `"default"`  | Animation easing preset.            |
| `animatePresence` | `boolean`                      | `true`       | Keep mounted for exit animation.    |
| `onShow`        | `() => void`                    | —            | Called when modal becomes visible.  |
| `onHide`        | `() => void`                    | —            | Called when hide starts.            |
| `onHidden`      | `() => void`                    | —            | Called after modal unmounts.        |

### loader(options)

| Option             | Type                 | Default | Notes                  |
| ------------------ | -------------------- | ------- | ---------------------- |
| `message`          | `string`             | —       | Optional loading text. |
| `render`           | `(api) => ReactNode` | —       | Full custom renderer.  |
| `styles.container` | `ViewStyle`          | —       | Container override.    |
| `styles.text`      | `TextStyle`          | —       | Text override.         |
| `styles.spinner`   | `ViewStyle`          | —       | Spinner wrap override. |
| `animation`        | `"none" \| "fade" \| "scale" \| "slide-up" \| "slide-down"` | `"fade"` | Enter/exit animation preset. |
| `animationDurationMs` | `number`          | `180`    | Animation duration in ms. |
| `animationEasing`  | `"default" \| "linear"` | `"default"` | Animation easing preset. |
| `animatePresence`  | `boolean`           | `true`   | Keep mounted for exit animation. |
| `onShow`           | `() => void`        | —        | Called when loader becomes visible. |
| `onHide`           | `() => void`        | —        | Called when hide starts. |
| `onHidden`         | `() => void`        | —        | Called after loader unmounts. |

### tooltip(options)

| Option             | Type                                               | Default  | Notes                               |
| ------------------ | -------------------------------------------------- | -------- | ----------------------------------- |
| `anchorRef`        | `TooltipAnchorRef`                                 | required | Ref used for positioning.           |
| `text`             | `string`                                           | —        | Built-in text.                      |
| `placement`        | `"auto" \| "top" \| "bottom" \| "left" \| "right"` | `"auto"` | Auto picks top/bottom.              |
| `type`             | `"info" \| "success" \| "warning" \| "error"`      | `"info"` | Built-in color theme.               |
| `dismissible`      | `boolean`                                          | `true`   | Outside press dismissal.            |
| `autoDismissMs`    | `number`                                           | —        | Auto-dismiss timeout.               |
| `styles.container` | `ViewStyle`                                        | —        | Container override.                 |
| `styles.text`      | `TextStyle`                                        | —        | Text override.                      |
| `render`           | `(api, options) => ReactNode`                      | —        | Full custom renderer.               |
| `avoidKeyboard`    | `boolean`                                          | `false`  | Shift upward when keyboard appears. |
| `animation`        | `"none" \| "fade" \| "scale" \| "slide-up" \| "slide-down"` | `"fade"` | Enter/exit animation preset. |
| `animationDurationMs` | `number`                                      | `180`     | Animation duration in ms.           |
| `animationEasing`  | `"default" \| "linear"`                            | `"default"` | Animation easing preset.          |
| `animatePresence`  | `boolean`                                          | `true`    | Keep mounted for exit animation.    |
| `onShow`           | `() => void`                                       | —         | Called when tooltip becomes visible.|
| `onHide`           | `() => void`                                       | —         | Called when hide starts.            |
| `onHidden`         | `() => void`                                       | —         | Called after tooltip unmounts.      |

### show(options)

| Option          | Type                               | Notes                               |
| --------------- | ---------------------------------- | ----------------------------------- |
| `type`          | `OverlayType`                      | Used by `hideAll(type)`.            |
| `group`         | `string`                           | Used by `hideGroup(group)`.         |
| `render`        | `(api, props) => ReactNode`        | Custom overlay renderer.            |
| `dismissible`   | `boolean`                          | Back button / backdrop dismissal.   |
| `blockTouches`  | `boolean`                          | Whether touches pass through.       |
| `backdrop`      | `"none" \| "transparent" \| "dim"` | Backdrop appearance.                |
| `priority`      | `number`                           | Higher value renders above lower.   |
| `insets`        | `"safeArea" \| "none" \| {...}`    | Insets strategy.                    |
| `avoidKeyboard` | `boolean`                          | Shift upward when keyboard appears. |
| `animation`     | `"none" \| "fade" \| "scale" \| "slide-up" \| "slide-down"` | Enter/exit animation preset. |
| `animationDurationMs` | `number`                    | Duration in ms.                     |
| `animationEasing` | `"default" \| "linear"`          | Easing preset.                      |
| `animatePresence` | `boolean`                        | Keep mounted for exit animation.    |
| `onShow`        | `() => void`                      | Called when overlay becomes visible.|
| `onHide`        | `() => void`                      | Called when hide starts.            |
| `onHidden`      | `() => void`                      | Called after overlay unmounts.      |

### OverlayProvider props

| Prop           | Type     | Default | Notes                               |
| -------------- | -------- | ------- | ----------------------------------- |
| `tabBarHeight` | `number` | `0`     | Used by `insets="safeArea+tabBar"`. |

## Example app

```sh
cd example && npm i && npx expo start
```

## Troubleshooting

- Safe-area support requires `react-native-safe-area-context`.
- Mount `<OverlayHost />` once near the root.
- Tooltips require a valid `anchorRef` (must be measurable).

## Safe-area note

Insets read from `react-native-safe-area-context` when available. If it is not installed or not provided, insets default to zero. Use `tabBarHeight` when using `insets="safeArea+tabBar"`.

## Keyboard avoidance

`avoidKeyboard` provides a minimal upward shift when the keyboard is visible. It is not a full scroll-to-input solution.

## Animations

All overlays can opt in to enter/exit animations via `animation`, `animationDurationMs`, and `animationEasing`. Built-in defaults:

- modal: `scale`
- toast: `slide-up`
- tooltip: `fade`
- loader: `fade`

## Lifecycle callbacks

Use `onShow`, `onHide`, and `onHidden` on any overlay (including built-ins) to react to appearance and dismissal. `onHidden` fires after exit animation completes (or immediately if animations are disabled).

## License

MIT. See [LICENSE](LICENSE).
