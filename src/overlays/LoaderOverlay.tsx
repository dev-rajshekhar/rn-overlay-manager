import * as React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import type { LoaderOptions } from "../types.js";

type LoaderOverlayProps = {
  message?: string;
  styles?: LoaderOptions["styles"];
};

export const LoaderOverlay = ({ message, styles }: LoaderOverlayProps) => {
  return (
    <View style={[defaultStyles.container, styles?.container]}>
      <View style={[defaultStyles.spinnerWrap, styles?.spinner]}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
      {message ? (
        <Text style={[defaultStyles.text, styles?.text]}>{message}</Text>
      ) : null}
    </View>
  );
};

const defaultStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  spinnerWrap: {
    marginBottom: 12
  },
  text: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    textAlign: "center"
  }
});
