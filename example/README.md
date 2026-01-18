# rn-overlay-manager example

## Run

From the repo root:

```sh
npm run build
```

From this folder:

```sh
npm install
npx expo start
```

## Demo coverage

- Custom toast UI + queued toasts
- Tooltip alignment and clamping near the edge
- Bottom overlay using `safeArea+tabBar`
- Modal + loader flow

## Verification checklist

- Custom toast renders with custom UI, and queued toasts show sequentially.
- Tooltip appears anchored to the help icon and clamps within the screen.
- Bottom overlay sits above the simulated tab bar when enabled.
- Modal confirm shows loader then a success toast.
- Rotate the device or resize the window to verify tooltip repositioning.
