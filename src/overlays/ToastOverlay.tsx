import * as React from "react";
import { StyleSheet, Text, View } from "react-native";

type ToastOverlayProps = {
  message: string;
  placement: "top" | "bottom";
  durationMs: number;
  onTimeout: () => void;
};

export const ToastOverlay = ({
  message,
  placement,
  durationMs,
  onTimeout
}: ToastOverlayProps) => {
  React.useEffect(() => {
    const timeout = setTimeout(onTimeout, durationMs);
    return () => clearTimeout(timeout);
  }, [durationMs, onTimeout]);

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        placement === "top" ? styles.alignTop : styles.alignBottom
      ]}
    >
      <View style={styles.toast}>
        <Text style={styles.toastText}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 16
  },
  alignTop: {
    justifyContent: "flex-start",
    paddingTop: 16
  },
  alignBottom: {
    justifyContent: "flex-end",
    paddingBottom: 16
  },
  toast: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    maxWidth: 320
  },
  toastText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600"
  }
});
