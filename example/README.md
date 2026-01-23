# rn-overlay-manager example

## Setup

1. Build the library (from repo root):

```sh
npm run build
```

2. Install dependencies (from example/):

```sh
npm install
```

3. Run:

```sh
npx expo start
```

## What the example shows

### Tabs

- **Overview**: modal, bottom modal (`safeArea+tabBar`), loader, keyboard avoidance.
- **Toasts**: quick toast, custom toast, top toast, queued toasts.
- **Tooltips**: edge clamping + custom render.

### Navigation + scope

- Overview is a stack with **Overview** + **Details**.
- **Screen-scoped modal** should disappear when you navigate.
- **Global toast** should persist across tabs.

## Verification checklist

- Show global toast, then switch tabs. It should persist until timeout.
- Show screen modal, then navigate to Details. It should dismiss.
- Show bottom modal and verify it sits above the tab bar (60px).
- Open the keyboard modal and ensure the input stays visible.
- Tap the tooltip icon near the edge; it should clamp within the screen.

## Animation demo

- Overview tab uses `scale` for modals.
- Toasts tab uses `slide-up` for all toasts.
- Tooltips tab uses `fade` for all tooltips.
- Verify enter/exit feel smooth and the keyboard modal still keeps the input visible.

## React Navigation integration (used here)

```tsx
<NavigationOverlayProvider tabBarHeight={60}>
  <NavigationContainer>...</NavigationContainer>
  <NavigationOverlayHost />
</NavigationOverlayProvider>
```
