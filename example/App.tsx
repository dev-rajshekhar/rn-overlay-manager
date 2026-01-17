import * as React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  OverlayHost,
  OverlayProvider,
  useOverlay,
  type OverlayRenderApi,
} from "rn-overlay-manager";

type OverlayRenderProps = {
  title: string;
  align?: "center" | "bottom" | "top";
  allowTouches?: boolean;
  backdropDismiss?: boolean;
};

const TestScreen = () => {
  const overlay = useOverlay();

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
        align: "center",
        backdropDismiss: true,
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
      props: { title: "Non-dismissible Overlay", align: "center" },
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
        align: "bottom",
        backdropDismiss: true,
      },
      render: renderOverlay,
      priority: 2,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
      insets: "safeArea",
    });
  };

  const showBottomNoInsets = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Bottom Overlay (no insets)",
        align: "bottom",
        backdropDismiss: true,
      },
      render: renderOverlay,
      priority: 2,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
      insets: "none",
    });
  };

  const showTopSafeArea = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Top Overlay (safe area)",
        align: "top",
        backdropDismiss: true,
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
      props: { title: "Overlay blocks touches", align: "center" },
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
        align: "center",
        backdropDismiss: true,
      },
      render: renderOverlay,
      priority: 3,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim",
    });
  };

  const showTwoOverlays = () => {
    overlay.show({
      type: "custom",
      props: {
        title: "Low Priority Overlay",
        align: "center",
        backdropDismiss: true,
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
        align: "center",
        backdropDismiss: true,
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
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Built-in modal</Text>
            <Text style={styles.insetsText}>{getInsetsText(api)}</Text>
            <Pressable style={styles.button} onPress={api.hide}>
              <Text style={styles.buttonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      ),
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>rn-overlay-manager example</Text>
      <Pressable style={styles.button} onPress={showDismissible}>
        <Text style={styles.buttonText}>Show dismissible overlay</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showNonDismissible}>
        <Text style={styles.buttonText}>Show non-dismissible overlay</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showBottomSafeArea}>
        <Text style={styles.buttonText}>Show bottom overlay (safe area)</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showBottomNoInsets}>
        <Text style={styles.buttonText}>Show bottom overlay (no insets)</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showTopSafeArea}>
        <Text style={styles.buttonText}>Show top overlay (safe area)</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showBlocksTouches}>
        <Text style={styles.buttonText}>Overlay blocks touches</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showAllowsTouches}>
        <Text style={styles.buttonText}>Overlay allows touches</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showBuiltInModal}>
        <Text style={styles.buttonText}>Show built-in modal</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={showTwoOverlays}>
        <Text style={styles.buttonText}>Show two overlays (priority)</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => overlay.hideAll()}>
        <Text style={styles.buttonText}>Hide all</Text>
      </Pressable>
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
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
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
