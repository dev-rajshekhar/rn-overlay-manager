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

## Verification checklist

- Bottom safe-area overlay sits above the home indicator; the no-insets overlay hugs the bottom edge.
- Top safe-area overlay does not collide with the notch/Dynamic Island.
- Touch test: when blockTouches is true, buttons behind are not clickable; when false, they are.
