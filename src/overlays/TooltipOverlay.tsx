import * as React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import type { LayoutRectangle } from "react-native";
import type { OverlayRenderApi, TooltipOptions } from "../types.js";
import { useOptionalSafeAreaInsets } from "../insets.js";

type TooltipOverlayProps = {
  api: OverlayRenderApi;
  options: TooltipOptions;
};

type AnchorLayout = LayoutRectangle;
type Size = { width: number; height: number };

const SCREEN_MARGIN = 8;
const TOOLTIP_GAP = 8;

const TYPE_COLORS: Record<NonNullable<TooltipOptions["type"]>, string> = {
  info: "#111827",
  success: "#16A34A",
  warning: "#D97706",
  error: "#DC2626"
};

const clamp = (value: number, min: number, max: number) => {
  const safeMax = Math.max(min, max);
  return Math.min(Math.max(value, min), safeMax);
};

export const TooltipOverlay = ({ api, options }: TooltipOverlayProps) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useOptionalSafeAreaInsets();
  const [anchorLayout, setAnchorLayout] = React.useState<AnchorLayout | null>(
    null
  );
  const [tooltipSize, setTooltipSize] = React.useState<Size | null>(null);

  const dismissible = options.dismissible ?? true;
  const placement = options.placement ?? "auto";
  const type = options.type ?? "info";
  const message = options.text;

  React.useEffect(() => {
    const node = options.anchorRef?.current;
    if (!node || typeof node.measureInWindow !== "function") {
      return;
    }
    node.measureInWindow((x, y, width, height) => {
      if (Number.isFinite(x) && Number.isFinite(y)) {
        setAnchorLayout({ x, y, width, height });
      }
    });
  }, [options.anchorRef]);

  React.useEffect(() => {
    if (!options.autoDismissMs) {
      return;
    }
    const timeout = setTimeout(api.hide, options.autoDismissMs);
    return () => clearTimeout(timeout);
  }, [api.hide, options.autoDismissMs]);

  if (!anchorLayout) {
    return null;
  }

  const maxWidth =
    screenWidth - insets.left - insets.right - SCREEN_MARGIN * 2;
  const maxHeight =
    screenHeight - insets.top - insets.bottom - SCREEN_MARGIN * 2;

  const topBound = insets.top + SCREEN_MARGIN;
  const leftBound = insets.left + SCREEN_MARGIN;
  const rightBound = screenWidth - insets.right - SCREEN_MARGIN;
  const bottomBound = screenHeight - insets.bottom - SCREEN_MARGIN;

  const resolvedPlacement =
    placement === "auto" && tooltipSize
      ? (() => {
          const spaceBelow =
            bottomBound - (anchorLayout.y + anchorLayout.height) - TOOLTIP_GAP;
          const spaceAbove =
            anchorLayout.y - topBound - TOOLTIP_GAP;
          return spaceBelow >= tooltipSize.height ? "bottom" : "top";
        })()
      : placement === "auto"
        ? "bottom"
        : placement;

  const left =
    tooltipSize
      ? clamp(
          anchorLayout.x + anchorLayout.width / 2 - tooltipSize.width / 2,
          leftBound,
          rightBound - tooltipSize.width
        )
      : leftBound;

  const top =
    tooltipSize
      ? clamp(
          resolvedPlacement === "bottom"
            ? anchorLayout.y + anchorLayout.height + TOOLTIP_GAP
            : anchorLayout.y - tooltipSize.height - TOOLTIP_GAP,
          topBound,
          bottomBound - tooltipSize.height
        )
      : topBound;

  const backgroundColor = TYPE_COLORS[type];
  const content = options.render ? options.render(api, options) : null;
  const showDefault = !options.render && Boolean(message);

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={StyleSheet.absoluteFill}
        pointerEvents={dismissible ? "auto" : "none"}
        onPress={dismissible ? api.hide : undefined}
      />
      <View
        style={[
          styles.tooltip,
          {
            maxWidth,
            maxHeight,
            backgroundColor,
            left,
            top,
            opacity: tooltipSize ? 1 : 0
          },
          options.styles?.container
        ]}
        onLayout={(event) => {
          const { width, height } = event.nativeEvent.layout;
          if (!tooltipSize || width !== tooltipSize.width || height !== tooltipSize.height) {
            setTooltipSize({ width, height });
          }
        }}
      >
        {showDefault ? (
          <Text style={[styles.text, options.styles?.text]}>{message}</Text>
        ) : (
          content
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  tooltip: {
    position: "absolute",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 }
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600"
  }
});
