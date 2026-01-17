import * as React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { OverlayRenderApi } from "../types.js";

type ModalOverlayProps = {
  api: OverlayRenderApi;
  dismissible: boolean;
  backdrop: "none" | "transparent" | "dim";
  children: React.ReactNode;
};

const getBackdropColor = (backdrop: ModalOverlayProps["backdrop"]) => {
  if (backdrop === "dim") {
    return "rgba(0,0,0,0.5)";
  }
  if (backdrop === "transparent") {
    return "transparent";
  }
  return undefined;
};

export const ModalOverlay = ({
  api,
  dismissible,
  backdrop,
  children
}: ModalOverlayProps) => {
  const backdropColor = getBackdropColor(backdrop);
  const shouldRenderBackdrop = backdrop !== "none" || dismissible;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {shouldRenderBackdrop ? (
        dismissible ? (
          <Pressable
            onPress={api.hide}
            style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor }]}
          />
        ) : (
          <View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor }]}
          />
        )
      ) : null}
      <View style={styles.content} pointerEvents="box-none">
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  content: {
    flex: 1
  }
});
