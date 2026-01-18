import * as React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  OverlayHost,
  OverlayProvider,
  useOverlay,
  type TooltipAnchorRef,
} from "rn-overlay-manager";

const DemoScreen = ({
  simulateTabBar,
  setSimulateTabBar,
}: {
  simulateTabBar: boolean;
  setSimulateTabBar: (value: boolean) => void;
}) => {
  const overlay = useOverlay();
  const tooltipAnchorRef = React.useRef<View | null>(null);

  const showCustomToast = () => {
    overlay.toast({
      message: "Custom toast",
      placement: "bottom",
      render: () => (
        <View style={styles.toastCard}>
          <Text style={styles.toastTitle}>Profile updated</Text>
          <Text style={styles.toastBody}>Your changes are live.</Text>
        </View>
      ),
    });
  };

  const showQueuedToasts = () => {
    overlay.toast({ message: "Queued toast 1" });
    overlay.toast({ message: "Queued toast 2" });
  };

  const showTopToast = () => {
    overlay.toast({ message: "Top toast", placement: "top" });
  };

  const showBottomToast = () => {
    overlay.toast({ message: "Bottom toast", placement: "bottom" });
  };

  const showTooltip = () => {
    overlay.tooltip({
      anchorRef: tooltipAnchorRef as unknown as TooltipAnchorRef,
      text: "This hint is clamped to the screen edge.",
      placement: "auto",
      type: "info",
    });
  };

  const showTooltipCustom = () => {
    overlay.tooltip({
      anchorRef: tooltipAnchorRef as unknown as TooltipAnchorRef,
      placement: "auto",
      styles: {
        container: styles.customTooltipContainer,
      },
      render: (api) => (
        <View style={styles.customTooltip}>
          <Text style={styles.customTooltipTitle}>Custom tooltip</Text>
          <Text style={styles.customTooltipBody}>
            Compact, branded, and fully custom.
          </Text>
          <Pressable style={styles.customTooltipButton} onPress={api.hide}>
            <Text style={styles.customTooltipButtonText}>Got it</Text>
          </Pressable>
        </View>
      ),
    });
  };

  const showBottomInset = () => {
    overlay.show({
      type: "custom",
      props: {},
      render: (api) => (
        <View style={styles.bottomSheetBackdrop}>
          <Pressable style={StyleSheet.absoluteFill} onPress={api.hide} />
          <View style={styles.bottomSheetWrap}>
            <View style={styles.bottomSheetCard}>
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.bottomSheetBadge}>Delivery</Text>
                <Text style={styles.bottomSheetTitle}>Preferences</Text>
              </View>
              <Text style={styles.bottomSheetBody}>
                This panel respects safeArea+tabBar to avoid the bottom bar.
              </Text>
              <View style={styles.bottomSheetList}>
                <Text style={styles.bottomSheetItem}>
                  - Evening slot (6–9 PM)
                </Text>
                <Text style={styles.bottomSheetItem}>- Contactless drop</Text>
              </View>
              <Pressable style={styles.outlineButton} onPress={api.hide}>
                <Text style={styles.outlineButtonText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ),
      priority: 20,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
      insets: "safeArea+tabBar",
    });
  };

  const showModal = () => {
    overlay.modal({
      dismissible: true,
      backdrop: "dim",
      render: (api) => (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm changes</Text>
            <Text style={styles.modalBody}>
              Review your changes before saving.
            </Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.outlineButton} onPress={api.hide}>
                <Text style={styles.outlineButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.outlineButton} onPress={api.hide}>
                <Text style={styles.outlineButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ),
    });
  };

  const showLoader = () => {
    const loaderId = overlay.loader({ message: "Syncing..." });
    setTimeout(() => overlay.hide(loaderId), 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Real Flows</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Custom toast</Text>
          <Text style={styles.cardBody}>
            Shows a custom-rendered toast and queued messages.
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.outlineButton} onPress={showQueuedToasts}>
              <Text style={styles.outlineButtonText}>Queued toasts</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={showCustomToast}>
              <Text style={styles.outlineButtonText}>Custom toast</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={showTopToast}>
              <Text style={styles.outlineButtonText}>Top toast</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={showBottomToast}>
              <Text style={styles.outlineButtonText}>Bottom toast</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View>
              <Text style={styles.cardTitle}>Tooltip alignment</Text>
              <Text style={styles.cardBody}>
                Tap the help icon near the edge to verify clamping.
              </Text>
            </View>
            <Pressable
              ref={tooltipAnchorRef}
              collapsable={false}
              onPress={showTooltip}
              style={styles.helpIcon}
            >
              <Text style={styles.helpIconText}>?</Text>
            </Pressable>
          </View>
          <View style={styles.row}>
            <Pressable style={styles.outlineButton} onPress={showTooltip}>
              <Text style={styles.outlineButtonText}>Default tooltip</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={showTooltipCustom}>
              <Text style={styles.outlineButtonText}>Custom tooltip</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bottom bar inset</Text>
          <Text style={styles.cardBody}>
            Simulate a tab bar and show a bottom overlay with safeArea+tabBar.
          </Text>
          <View style={styles.row}>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Simulate tab bar</Text>
              <Switch
                value={simulateTabBar}
                onValueChange={setSimulateTabBar}
              />
            </View>
            <Pressable style={styles.outlineButton} onPress={showBottomInset}>
              <Text style={styles.outlineButtonText}>Show bottom overlay</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Modal + loader</Text>
          <Text style={styles.cardBody}>
            Modal and loader are separate demos.
          </Text>
          <View style={styles.row}>
            <Pressable style={styles.outlineButton} onPress={showModal}>
              <Text style={styles.outlineButtonText}>Open modal</Text>
            </Pressable>
            <Pressable style={styles.outlineButton} onPress={showLoader}>
              <Text style={styles.outlineButtonText}>Show loader</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  const [simulateTabBar, setSimulateTabBar] = React.useState(false);

  return (
    <SafeAreaProvider>
      <OverlayProvider tabBarHeight={simulateTabBar ? 60 : 0}>
        <View style={styles.appRoot}>
          <DemoScreen
            simulateTabBar={simulateTabBar}
            setSimulateTabBar={setSimulateTabBar}
          />
          <OverlayHost />
        </View>
      </OverlayProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardBody: {
    fontSize: 13,
    color: "#475569",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toggleLabel: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#0F172A",
    fontWeight: "600",
    fontSize: 13,
  },
  helpIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  helpIconText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  toastCard: {
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
  },
  toastTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  toastBody: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  bottomSheetBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  bottomSheetWrap: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  bottomSheetCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bottomSheetHeader: {
    gap: 4,
  },
  bottomSheetBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  bottomSheetTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  bottomSheetBody: {
    fontSize: 13,
    color: "#475569",
  },
  bottomSheetList: {
    gap: 4,
  },
  bottomSheetItem: {
    fontSize: 12,
    color: "#475569",
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  modalBody: {
    fontSize: 13,
    color: "#475569",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  customTooltipContainer: {
    backgroundColor: "transparent",
    paddingHorizontal: 0,
    paddingVertical: 0,
    shadowOpacity: 0,
  },
  customTooltip: {
    backgroundColor: "#0F172A",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    maxWidth: 220,
  },
  customTooltipTitle: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  customTooltipBody: {
    color: "#E2E8F0",
    fontSize: 11,
  },
  customTooltipButton: {
    alignSelf: "flex-start",
    backgroundColor: "#38BDF8",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  customTooltipButtonText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "700",
  },
});

export default App;
