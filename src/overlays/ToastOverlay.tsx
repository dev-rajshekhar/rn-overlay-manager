import * as React from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { StyleSheet, Text, View } from "react-native";

type ToastOverlayProps = {
  message: string;
  placement: "top" | "bottom";
  durationMs: number;
  onTimeout: () => void;
  toastStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  children?: React.ReactNode;
};

export const ToastOverlay = ({
  message,
  placement,
  durationMs,
  onTimeout,
  toastStyle,
  textStyle,
  backgroundColor,
  children
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
      {children ? (
        children
      ) : (
        <View
          style={[
            styles.toast,
            backgroundColor ? { backgroundColor } : null,
            toastStyle
          ]}
        >
          <Text style={[styles.toastText, textStyle]}>{message}</Text>
        </View>
      )}
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
