import * as React from "react";
import {
  Animated,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import type { LayoutRectangle } from "react-native";
import type { OverlayRenderApi, TooltipOptions } from "../types.js";
import { useOptionalSafeAreaInsets } from "../insets.js";
import { warnTooltipAnchorInvalid } from "../devWarnings.js";

type TooltipOverlayProps = {
  api: OverlayRenderApi;
  options: TooltipOptions;
};

type AnchorLayout = LayoutRectangle;
type Size = { width: number; height: number };

const SCREEN_MARGIN = 8;
const TOOLTIP_GAP = 4;
const ARROW_BASE = 12;
const ARROW_HEIGHT = 6;

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
  const measureTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const invalidMeasureRef = React.useRef(0);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const dismissible = options.dismissible ?? true;
  const placement = options.placement ?? "auto";
  const type = options.type ?? "info";
  const message = options.text;

  React.useEffect(() => {
    const node = options.anchorRef?.current;
    const hasMeasureInWindow =
      node && typeof (node as any).measureInWindow === "function";
    const hasMeasure = node && typeof (node as any).measure === "function";

    if (measureTimeoutRef.current) {
      clearTimeout(measureTimeoutRef.current);
    }

    const scheduleRetry = () => {
      invalidMeasureRef.current += 1;
      if (invalidMeasureRef.current >= 2) {
        warnTooltipAnchorInvalid();
        return;
      }
      measureTimeoutRef.current = setTimeout(() => {
        opacity.setValue(0);
        measure();
      }, 50);
    };

    const onMeasure = (
      x: number,
      y: number,
      width: number,
      height: number,
      pageX?: number,
      pageY?: number
    ) => {
      const finalX = pageX ?? x;
      let finalY = pageY ?? y;

      if (Platform.OS === "android" && StatusBar.currentHeight) {
        // Correction for Android measurement often excluding StatusBar
        finalY += StatusBar.currentHeight;
      }

      if (Number.isFinite(finalX) && Number.isFinite(finalY)) {
        invalidMeasureRef.current = 0;
        setAnchorLayout((prev) => {
          if (
            prev &&
            prev.x === finalX &&
            prev.y === finalY &&
            prev.width === width &&
            prev.height === height
          ) {
            return prev;
          }
          return { x: finalX, y: finalY, width, height };
        });
        return;
      }

      scheduleRetry();
    };

    const measure = () => {
      if (hasMeasureInWindow) {
        (node as any).measureInWindow(onMeasure);
        return;
      }
      if (hasMeasure) {
        (node as any).measure(onMeasure);
        return;
      }
      scheduleRetry();
    };

    if (!hasMeasureInWindow && !hasMeasure) {
      scheduleRetry();
      return;
    }

    measureTimeoutRef.current = setTimeout(() => {
      opacity.setValue(0);
      measure();
    }, 0);

    return () => {
      if (measureTimeoutRef.current) {
        clearTimeout(measureTimeoutRef.current);
        measureTimeoutRef.current = null;
      }
    };
  }, [
    api,
    insets.bottom,
    insets.left,
    insets.right,
    insets.top,
    options.anchorRef,
    screenHeight,
    screenWidth
  ]);

  React.useEffect(() => {
    if (!options.autoDismissMs) {
      return;
    }
    const timeout = setTimeout(api.hide, options.autoDismissMs);
    return () => clearTimeout(timeout);
  }, [api.hide, options.autoDismissMs]);



  React.useEffect(() => {
    if (!tooltipSize || !anchorLayout) {
      return;
    }
    Animated.timing(opacity, {
      toValue: 1,
      duration: 120,
      useNativeDriver: true
    }).start();
  }, [anchorLayout, opacity, tooltipSize]);

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
          const spaceAbove = anchorLayout.y - topBound - TOOLTIP_GAP;
          return spaceBelow >= tooltipSize.height ? "bottom" : "top";
        })()
      : placement === "auto"
        ? "bottom"
        : placement;

  const anchorCenterX = anchorLayout.x + anchorLayout.width / 2;
  const anchorCenterY = anchorLayout.y + anchorLayout.height / 2;

  const left =
    tooltipSize
      ? resolvedPlacement === "left"
        ? clamp(
            anchorLayout.x - tooltipSize.width - TOOLTIP_GAP - ARROW_HEIGHT,
            leftBound,
            rightBound - tooltipSize.width
          )
        : resolvedPlacement === "right"
          ? clamp(
              anchorLayout.x +
                anchorLayout.width +
                TOOLTIP_GAP +
                ARROW_HEIGHT,
              leftBound,
              rightBound - tooltipSize.width
            )
          : clamp(
              anchorCenterX - tooltipSize.width / 2,
              leftBound,
              rightBound - tooltipSize.width
            )
      : leftBound;

  const top =
    tooltipSize
      ? resolvedPlacement === "left" || resolvedPlacement === "right"
        ? clamp(
            anchorCenterY - tooltipSize.height / 2,
            topBound,
            bottomBound - tooltipSize.height
          )
        : clamp(
            resolvedPlacement === "bottom"
              ? anchorLayout.y +
                  anchorLayout.height +
                  TOOLTIP_GAP +
                  ARROW_HEIGHT
              : anchorLayout.y -
                  tooltipSize.height -
                  TOOLTIP_GAP -
                  ARROW_HEIGHT,
            topBound,
            bottomBound - tooltipSize.height
          )
      : topBound;

  const BORDER_RADIUS = 10;
  
  // 1. Calculate the ideal center position of the arrow relative to the screen
  // This is the point on the screen where the arrow *wants* to point (center of anchor)
  const idealArrowCenterX = anchorCenterX;
  const idealArrowCenterY = anchorCenterY;

  // 2. Determine the bounds of the tooltip relative to the screen
  const tooltipLeft = left;
  const tooltipTop = top;
  const tooltipRight = left + (tooltipSize?.width ?? 0);
  const tooltipBottom = top + (tooltipSize?.height ?? 0);

  // 3. Constrain the arrow center so it stays attached to the tooltip
  // We want the arrow to stay within the straight edges of the tooltip, avoiding corners.
  // Valid range for arrow center X: [tooltipLeft + radius + arrowHalf, tooltipRight - radius - arrowHalf]
  const arrowHalfWidth = ARROW_BASE / 2; // 6
  
  const minArrowCenterX = tooltipLeft + BORDER_RADIUS + arrowHalfWidth;
  const maxArrowCenterX = tooltipRight - BORDER_RADIUS - arrowHalfWidth;
  
  const minArrowCenterY = tooltipTop + BORDER_RADIUS + arrowHalfWidth; // using half width because arrow is triangular
  const maxArrowCenterY = tooltipBottom - BORDER_RADIUS - arrowHalfWidth;

  // 4. Calculate final arrow position (top-left of the arrow element)
  let finalArrowLeft = 0;
  let finalArrowTop = 0;

  if (resolvedPlacement === "top" || resolvedPlacement === "bottom") {
    // Arrow moves horizontally
    const clampedCenterX = clamp(idealArrowCenterX, minArrowCenterX, maxArrowCenterX);
    // Convert screen coordinate back to local tooltip coordinate (or stay relative to screen if arrow is outside tooltip)
    // Actually, let's keep arrow absolute on screen to match tooltip absolute on screen.
    finalArrowLeft = clampedCenterX - arrowHalfWidth;
    
    // Vertical position depends purely on placement
    if (resolvedPlacement === "top") {
      finalArrowTop = top + (tooltipSize?.height ?? 0); // Right below the tooltip
    } else {
      finalArrowTop = top - ARROW_HEIGHT; // Right above the tooltip
    }
  } else {
    // Left or Right placement: Arrow moves vertically
    const clampedCenterY = clamp(idealArrowCenterY, minArrowCenterY, maxArrowCenterY);
    finalArrowTop = clampedCenterY - arrowHalfWidth; // Reuse half-width for 45deg symmetry or just mapping? 
    // Actually arrow height/width definitions: 
    // Vertical arrow (pointing L/R): width is "base" (vertical axis), height is "depth" (horizontal axis)
    
    if (resolvedPlacement === "left") {
      finalArrowLeft = left + (tooltipSize?.width ?? 0);
    } else {
      finalArrowLeft = left - ARROW_HEIGHT;
    }
  }

  // No extra clamping needed for the arrow itself if we did step 3 correctly.
  
  const backgroundColor = TYPE_COLORS[type];
  const arrowColor = backgroundColor;
  const content = options.render ? options.render(api, options) : null;
  const showDefault = !options.render && Boolean(message);
  
  const arrowStyle =
    resolvedPlacement === "top"
      ? {
          borderLeftWidth: ARROW_BASE / 2,
          borderRightWidth: ARROW_BASE / 2,
          borderTopWidth: ARROW_HEIGHT,
          borderLeftColor: "transparent",
          borderRightColor: "transparent",
          borderTopColor: arrowColor
        }
      : resolvedPlacement === "bottom"
        ? {
            borderLeftWidth: ARROW_BASE / 2,
            borderRightWidth: ARROW_BASE / 2,
            borderBottomWidth: ARROW_HEIGHT,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderBottomColor: arrowColor
          }
        : resolvedPlacement === "left"
          ? {
              borderTopWidth: ARROW_BASE / 2,
              borderBottomWidth: ARROW_BASE / 2,
              borderLeftWidth: ARROW_HEIGHT,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              borderLeftColor: arrowColor
            }
          : {
              borderTopWidth: ARROW_BASE / 2,
              borderBottomWidth: ARROW_BASE / 2,
              borderRightWidth: ARROW_HEIGHT,
              borderTopColor: "transparent",
              borderBottomColor: "transparent",
              borderRightColor: arrowColor
            };

  return (
    <View style={styles.root} pointerEvents="box-none">
      <Pressable
        style={StyleSheet.absoluteFill}
        pointerEvents={dismissible ? "auto" : "none"}
        onPress={dismissible ? api.hide : undefined}
      />
      <Animated.View
        style={[
          styles.tooltip,
          {
            maxWidth,
            maxHeight,
            backgroundColor,
            left,
            top,
            opacity
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
      </Animated.View>
      <View
        pointerEvents="none"
        style={[
          styles.arrow,
          {
            left: finalArrowLeft,
            top: finalArrowTop,
            opacity: tooltipSize ? 1 : 0
          },
          arrowStyle
        ]}
      />
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
  },
  arrow: {
    position: "absolute",
    width: 0,
    height: 0
  }
});
