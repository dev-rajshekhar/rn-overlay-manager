# Changelog

## 0.4.0
- React Navigation adapter (NavigationOverlayProvider / NavigationOverlayHost)
- Overlay scope support: `global` vs `screen`
- Screen-scoped overlays auto-clear on navigation change
- `safeArea+tabBar` integration via navigation adapter
- Navigation-based example app demonstrating real flows

## 0.3.0
- Tooltip robustness improvements (measurement, clamping, rotation handling)
- Tooltip pointer triangle updates and alignment fixes
- Keyboard avoidance support (`avoidKeyboard`)
- Example app redesigned with focused demos + keyboard modal
- Public API docs expanded (TSDoc comments)

## 0.2.0
- Dev warnings for missing/multiple OverlayHost and invalid tooltip anchorRef
- Overlay groups with `group` + `hideGroup(group)`
- `safeArea+tabBar` support with `tabBarHeight`
- Tooltip placements expanded (left/right) and pointer refinements
- Toast customization (render + styling)
- Built-in loader helper
- Example app expanded demos

## 0.1.0
- Initial release
- OverlayProvider + OverlayHost
- Overlay store with stacking + priority
- Android back button handling
- Built-in helpers: modal, toast, loader, tooltip
- Safe-area inset support (via react-native-safe-area-context)
- Expo example app for manual testing
