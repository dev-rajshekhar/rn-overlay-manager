import * as React from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View
} from "react-native";
import {
  OverlayHost,
  OverlayProvider,
  useOverlay,
  type OverlayRenderApi
} from "rn-overlay-manager";

type OverlayCardProps = {
  title: string;
};

const OverlayCard = ({ title, onClose }: { title: string; onClose: () => void }) => {
  return (
    <View style={styles.overlayContainer}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Pressable style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </Pressable>
      </View>
    </View>
  );
};

const TestScreen = () => {
  const overlay = useOverlay();

  const renderOverlay = (api: OverlayRenderApi, props: OverlayCardProps) => (
    <OverlayCard title={props.title} onClose={api.hide} />
  );

  const showDismissible = () => {
    overlay.show({
      type: "custom",
      props: { title: "Dismissible Overlay" },
      render: renderOverlay,
      priority: 1,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim"
    });
  };

  const showNonDismissible = () => {
    overlay.show({
      type: "custom",
      props: { title: "Non-dismissible Overlay" },
      render: renderOverlay,
      priority: 1,
      dismissible: false,
      blockTouches: true,
      backdrop: "dim"
    });
  };

  const showTwoOverlays = () => {
    overlay.show({
      type: "custom",
      props: { title: "Low Priority Overlay" },
      render: renderOverlay,
      priority: 1,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim"
    });

    overlay.show({
      type: "custom",
      props: { title: "High Priority Overlay" },
      render: renderOverlay,
      priority: 10,
      dismissible: true,
      blockTouches: true,
      backdrop: "dim"
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
    <OverlayProvider>
      <View style={styles.appRoot}>
        <TestScreen />
        <OverlayHost />
      </View>
    </OverlayProvider>
  );
};

const styles = StyleSheet.create({
  appRoot: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8
  },
  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    width: "100%",
    alignItems: "center"
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600"
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center"
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    minWidth: 240,
    alignItems: "center",
    gap: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600"
  }
});

export default App;
