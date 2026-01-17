import * as React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  OverlayHost,
  OverlayProvider,
  useOverlay,
  type OverlayRenderApi,
  type TooltipAnchorRef,
} from "rn-overlay-manager";

type OverlayRenderProps = {
  title: string;
  description?: string;
  align?: "center" | "bottom" | "top";
  allowTouches?: boolean;
  backdropDismiss?: boolean;
  debug: OverlayDebugInfo;
};

type OverlayDebugInfo = {
  type: string;
  dismissible: boolean;
  blockTouches: boolean;
  priority: number;
  insets?: string;
};

type ActionButtonProps = {
  label: string;
  helper: string;
  onPress: () => void;
};

const OverlayDebugCard = ({ info }: { info: OverlayDebugInfo }) => {
  return (
    <View style={styles.debugCard}>
      <Text style={styles.debugTitle}>Debug</Text>
      <Text style={styles.debugText}>Type: {info.type}</Text>
      <Text style={styles.debugText}>
        Dismissible: {info.dismissible ? "true" : "false"}
      </Text>
      <Text style={styles.debugText}>
        Block touches: {info.blockTouches ? "true" : "false"}
      </Text>
      <Text style={styles.debugText}>Priority: {info.priority}</Text>
      <Text style={styles.debugText}>
        Insets mode: {info.insets ?? "default"}
      </Text>
    </View>
  );
};

const ActionButton = ({ label, helper, onPress }: ActionButtonProps) => {
  return (
    <View style={styles.actionRow}>
      <Pressable style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{label}</Text>
      </Pressable>
      <Text style={styles.helperText}>{helper}</Text>
    </View>
  );
};

const TestScreen = () => {
  const overlay = useOverlay();
  const centerAnchorRef = React.useRef<View | null>(null);
  const topRightAnchorRef = React.useRef<View | null>(null);
  const bottomLeftAnchorRef = React.useRef<View | null>(null);

  const getInsetsText = (api: OverlayRenderApi) => {
    const insets = api.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };
    return `Insets: top=${insets.top} bottom=${insets.bottom} left=${insets.left} right=${insets.right}`;
  };

  const hasZeroInsets = (api: OverlayRenderApi) => {
    const insets = api.insets ?? { top: 0, bottom: 0, left: 0, right: 0 };
    return (
      insets.top === 0 &&
      insets.bottom === 0 &&
      insets.left === 0 &&
      insets.right === 0
    );
  };

  const renderOverlay = (api: OverlayRenderApi, props: OverlayRenderProps) => {
    const alignStyle =
      props.align === "bottom"
        ? styles.overlayBottom
        : props.align === "top"
          ? styles.overlayTop
          : styles.overlayCenter;

    return (
      <View
        style={[styles.overlayContainer, alignStyle]}
        pointerEvents={props.allowTouches ? "box-none" : "auto"}
      >
        {props.backdropDismiss ? (
          <Pressable style={StyleSheet.absoluteFill} onPress={api.hide} />
        ) : null}
        <View pointerEvents="auto" style={styles.card}>
          <Text style={styles.cardTitle}>{props.title}</Text>
          {props.description ? (
            <Text style={styles.cardDescription}>{props.description}</Text>
          ) : null}
          <OverlayDebugCard info={props.debug} />
          <Text style={styles.insetsText}>{getInsetsText(api)}</Text>
          {hasZeroInsets(api) ? (
            <Text style={styles.warningText}>
              Safe-area insets are 0. Ensure SafeAreaProvider is set up.
            </Text>
          ) : null}
          <Pressable style={styles.button} onPress={api.hide}>
            <Text style={styles.buttonText}>Close</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const showDismissible = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Dismissible Overlay",
        description: "Backdrop tap should dismiss this overlay.",
        align: "center",
        backdropDismiss: true,
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: true,
          priority: 1,
        },
      },
      render: renderOverlay,
      priority: 1,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
    });
  };

  const showNonDismissible = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Non-dismissible Overlay",
        description: "Backdrop tap should NOT dismiss.",
        align: "center",
        debug: {
          type: "custom",
          dismissible: false,
          blockTouches: true,
          priority: 1,
        },
      },
      render: renderOverlay,
      priority: 1,
      dismissible: false,
      blockTouches: true,
      backdrop: "dim",
    });
  };

  const showBottomSafeArea = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Bottom Overlay (safe area)",
        description: "Bottom-aligned and padded by safe-area insets.",
        align: "bottom",
        backdropDismiss: true,
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: true,
          priority: 2,
          insets: "safeArea",
        },
      },
      render: renderOverlay,
      priority: 2,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
      insets: "safeArea",
    });
  };

  const showTopSafeArea = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Top Overlay (safe area)",
        description: "Top-aligned and padded for Dynamic Island/notch.",
        align: "top",
        backdropDismiss: true,
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: true,
          priority: 2,
          insets: "safeArea",
        },
      },
      render: renderOverlay,
      priority: 2,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
      insets: "safeArea",
    });
  };

  const showBlocksTouches = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Overlay blocks touches",
        description: "Underlying UI should NOT be clickable.",
        align: "center",
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: true,
          priority: 3,
        },
      },
      render: renderOverlay,
      priority: 3,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
    });
  };

  const showAllowsTouches = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Overlay allows touches",
        description: "Underlying UI should remain clickable.",
        align: "center",
        allowTouches: true,
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: false,
          priority: 3,
        },
      },
      render: renderOverlay,
      priority: 3,
      dismissible: true,
      blockTouches: false,
      backdrop: "dim",
    });
  };

  const showTwoOverlays = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Low Priority Overlay",
        description: "Should appear behind the high-priority overlay.",
        align: "center",
        backdropDismiss: true,
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: true,
          priority: 1,
        },
      },
      render: renderOverlay,
      priority: 1,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
    });

    overlay.show({
      type: "custom",
      props: {
        title: "High Priority Overlay",
        description: "Should appear above the low-priority overlay.",
        align: "center",
        backdropDismiss: true,
        debug: {
          type: "custom",
          dismissible: true,
          blockTouches: true,
          priority: 10,
        },
      },
      render: renderOverlay,
      priority: 10,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
    });
  };

  const showBuiltInModal = () => {
    overlay.modal({
      dismissible: true,
      backdrop: "dim",
      render: (api) => (
        <View style={styles.modalContentContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Built-in modal</Text>
            <Text style={styles.modalDescription}>
              This uses overlay.modal() with a dim backdrop and safe-area
              padding.
            </Text>
            <OverlayDebugCard
              info={{
                type: "modal",
                dismissible: true,
                blockTouches: true,
                priority: 90,
                insets: "safeArea",
              }}
            />
            <Text style={styles.insetsText}>{getInsetsText(api)}</Text>
            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryButton} onPress={api.hide}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryButton} onPress={api.hide}>
                <Text style={styles.primaryButtonText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      ),
    });
  };

  const showToastBottom = () => {
    overlay.toast({ message: "Bottom toast", placement: "bottom" });
  };

  const showToastTop = () => {
    overlay.toast({ message: "Top toast", placement: "top" });
  };

  const queueToasts = () => {
    overlay.toast({ message: "Queued toast 1", placement: "bottom" });
    overlay.toast({ message: "Queued toast 2", placement: "bottom" });
    overlay.toast({ message: "Queued toast 3", placement: "bottom" });
  };

  const showStyledToast = () => {
    overlay.toast({
      message: "Styled toast",
      placement: "bottom",
      backgroundColor: "#2563EB",
      textStyle: { fontWeight: "700" },
      toastStyle: { borderRadius: 12 },
    });
  };

  const showCustomToast = () => {
    overlay.toast({
      message: "Custom toast",
      placement: "top",
      render: () => (
        <View style={styles.customToast}>
          <Text style={styles.customToastTitle}>Custom toast</Text>
          <Text style={styles.customToastBody}>Fully custom render.</Text>
        </View>
      ),
    });
  };

  const showLoader = () => {
    const id = overlay.loader({ message: "Loading for 2s..." });
    setTimeout(() => overlay.hide(id), 2000);
  };

  const showCustomLoader = () => {
    const id = overlay.loader({
      render: () => (
        <View style={styles.customLoaderContainer}>
          <View style={styles.customLoader}>
            <Text style={styles.customLoaderTitle}>Custom loader</Text>
            <Text style={styles.customLoaderBody}>
              Waiting on something important.
            </Text>
          </View>
        </View>
      ),
    });
    setTimeout(() => overlay.hide(id), 2000);
  };

  const showTooltipAuto = () => {
    overlay.tooltip({
      anchorRef: centerAnchorRef as unknown as TooltipAnchorRef,
      text: "Auto placement tooltip.",
      placement: "auto",
      type: "success",
      autoDismissMs: 2500,
    });
  };

  const showTooltipTop = () => {
    overlay.tooltip({
      anchorRef: bottomLeftAnchorRef as unknown as TooltipAnchorRef,
      text: "Pinned above the anchor.",
      placement: "top",
      type: "warning",
    });
  };

  const showTooltipLeft = () => {
    overlay.tooltip({
      anchorRef: centerAnchorRef as unknown as TooltipAnchorRef,
      text: "Left placement tooltip.",
      placement: "left",
      type: "info",
    });
  };

  const showTooltipRight = () => {
    overlay.tooltip({
      anchorRef: centerAnchorRef as unknown as TooltipAnchorRef,
      text: "Right placement tooltip.",
      placement: "right",
      type: "info",
    });
  };

  const showTooltipCustom = () => {
    overlay.tooltip({
      anchorRef: topRightAnchorRef as unknown as TooltipAnchorRef,
      placement: "bottom",
      type: "success",
      render: (api) => (
        <View style={styles.customTooltip}>
          <Text style={styles.customTooltipTitle}>Custom tooltip</Text>
          <Text style={styles.customTooltipBody}>
            Render override with custom layout.
          </Text>
          <Pressable onPress={api.hide} style={styles.customTooltipButton}>
            <Text style={styles.customTooltipButtonText}>Got it</Text>
          </Pressable>
        </View>
      ),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>rn-overlay-manager example</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Built-in APIs</Text>
          <ActionButton
            label="Show built-in modal"
            helper="Dim backdrop, dismissible, shows inset/debug details."
            onPress={showBuiltInModal}
          />
          <ActionButton
            label="Show toast (bottom)"
            helper="Non-blocking toast aligned to bottom safe area."
            onPress={showToastBottom}
          />
          <ActionButton
            label="Show toast (top)"
            helper="Non-blocking toast aligned to top safe area."
            onPress={showToastTop}
          />
          <ActionButton
            label="Queue 3 toasts"
            helper="Toasts should appear one after another."
            onPress={queueToasts}
          />
          <ActionButton
            label="Show styled toast"
            helper="Uses toastStyle/textStyle/backgroundColor options."
            onPress={showStyledToast}
          />
          <ActionButton
            label="Show custom toast"
            helper="Uses toast.render for full UI control."
            onPress={showCustomToast}
          />
          <ActionButton
            label="Show loader (2s)"
            helper="Blocks touches with dim backdrop, auto-hides."
            onPress={showLoader}
          />
          <ActionButton
            label="Show custom loader"
            helper="Uses loader.render to customize UI."
            onPress={showCustomLoader}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom overlays</Text>
          <ActionButton
            label="Custom dismissible overlay"
            helper="Tap outside to dismiss."
            onPress={showDismissible}
          />
          <ActionButton
            label="Custom non-dismissible overlay"
            helper="Backdrop tap should NOT dismiss."
            onPress={showNonDismissible}
          />
          <ActionButton
            label="Bottom overlay (safe area)"
            helper="Bottom-aligned with safe-area padding."
            onPress={showBottomSafeArea}
          />
          <ActionButton
            label="Top overlay (safe area)"
            helper="Top-aligned below Dynamic Island/notch."
            onPress={showTopSafeArea}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Behavior tests</Text>
          <ActionButton
            label="Priority demo (two overlays)"
            helper="High priority should appear above low priority."
            onPress={showTwoOverlays}
          />
          <ActionButton
            label="Overlay blocks touches"
            helper="Underlying UI should NOT be clickable."
            onPress={showBlocksTouches}
          />
          <ActionButton
            label="Overlay allows touches"
            helper="Underlying UI should remain clickable."
            onPress={showAllowsTouches}
          />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tooltip demos</Text>
          <View style={styles.anchorStage}>
            <View
              ref={topRightAnchorRef}
              collapsable={false}
              style={[styles.anchor, styles.anchorTopRight]}
            >
              <Text style={styles.anchorText}>Edge</Text>
            </View>
            <View
              ref={bottomLeftAnchorRef}
              collapsable={false}
              style={[styles.anchor, styles.anchorBottomLeft]}
            >
              <Text style={styles.anchorText}>Edge</Text>
            </View>
            <View
              ref={centerAnchorRef}
              collapsable={false}
              style={[styles.anchor, styles.anchorCenter]}
            >
              <Text style={styles.anchorText}>Center</Text>
            </View>
          </View>
          <ActionButton
            label="Show tooltip (auto)"
            helper="Auto placement with clamping."
            onPress={showTooltipAuto}
          />
          <ActionButton
            label="Show tooltip (top)"
            helper="Forced top placement."
            onPress={showTooltipTop}
          />
          <ActionButton
            label="Show tooltip (left)"
            helper="Forced left placement."
            onPress={showTooltipLeft}
          />
          <ActionButton
            label="Show tooltip (right)"
            helper="Forced right placement."
            onPress={showTooltipRight}
          />
          <ActionButton
            label="Show tooltip (custom render)"
            helper="Uses tooltip.render for custom UI."
            onPress={showTooltipCustom}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <OverlayProvider>
        <View style={styles.appRoot}>
          <TestScreen />
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
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  section: {
    width: "100%",
    gap: 10,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  actionRow: {
    gap: 6,
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  overlayCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  overlayBottom: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  overlayTop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalContentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    width: "100%",
    maxWidth: 360,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalDescription: {
    fontSize: 14,
    color: "#374151",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
  },
  primaryButton: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: "#111827",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    minWidth: 240,
    alignItems: "center",
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
  },
  debugCard: {
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  debugTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  debugText: {
    fontSize: 12,
    color: "#374151",
  },
  customToast: {
    backgroundColor: "#111827",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
    gap: 4,
  },
  customToastTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  customToastBody: {
    color: "#D1D5DB",
    fontSize: 12,
  },
  customLoader: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 6,
    shadowColor: "#111827",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  customLoaderTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  customLoaderBody: {
    fontSize: 12,
    color: "#6B7280",
  },
  customLoaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  anchorStage: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    overflow: "hidden",
  },
  anchor: {
    position: "absolute",
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  anchorText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },
  anchorTopRight: {
    top: 8,
    right: 8,
  },
  anchorBottomLeft: {
    bottom: 8,
    left: 8,
  },
  anchorCenter: {
    top: "50%",
    left: "50%",
    transform: [{ translateX: -24 }, { translateY: -12 }],
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  customTooltipButtonText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "700",
  },
  insetsText: {
    fontSize: 12,
    color: "#4B5563",
  },
  warningText: {
    fontSize: 12,
    color: "#B91C1C",
    textAlign: "center",
  },
});

export default App;
