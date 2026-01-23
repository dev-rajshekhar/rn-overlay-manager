import * as React from "react";
import { Animated, Easing, View, type ViewStyle } from "react-native";
import type { OverlayAnimation, OverlayAnimationEasing } from "../types.js";
import { warnInvalidAnimation } from "../devWarnings.js";

type AnimatedOverlayContainerProps = {
  visible: boolean;
  animation?: OverlayAnimation;
  durationMs?: number;
  easing?: OverlayAnimationEasing;
  onExited?: () => void;
  style?: ViewStyle;
  stackIndex?: number;
  stackSize?: number;
  children: React.ReactNode;
};

const getHiddenValues = (animation: OverlayAnimation) => {
  switch (animation) {
    case "fade":
      return { opacity: 0, scale: 1, translateY: 0 };
    case "scale":
      return { opacity: 0, scale: 0.9, translateY: 0 };
    case "slide-up":
      return { opacity: 0, scale: 1, translateY: 24 };
    case "slide-down":
      return { opacity: 0, scale: 1, translateY: -24 };
    case "none":
    default:
      return { opacity: 1, scale: 1, translateY: 0 };
  }
};

const isValidAnimation = (animation: string): animation is OverlayAnimation => {
  return (
    animation === "none" ||
    animation === "fade" ||
    animation === "scale" ||
    animation === "slide-up" ||
    animation === "slide-down"
  );
};

const getVisibleValues = () => ({
  opacity: 1,
  scale: 1,
  translateY: 0
});

const resolveEasing = (preset: OverlayAnimationEasing) => {
  if (preset === "linear") {
    return Easing.linear;
  }
  return Easing.out(Easing.ease);
};

export const AnimatedOverlayContainer = ({
  visible,
  animation = "none",
  durationMs = 180,
  easing = "default",
  onExited,
  style,
  stackIndex,
  stackSize,
  children
}: AnimatedOverlayContainerProps) => {
  const opacity = React.useRef(new Animated.Value(1)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const prevVisibleRef = React.useRef<boolean | null>(null);

  const resolvedAnimation = React.useMemo<OverlayAnimation>(() => {
    if (isValidAnimation(animation)) {
      return animation;
    }
    if (typeof animation === "string") {
      warnInvalidAnimation(animation);
    }
    return "none";
  }, [animation]);

  const isTop =
    typeof stackIndex === "number" && typeof stackSize === "number"
      ? stackIndex === 0
      : true;
  const hasStack = typeof stackSize === "number" ? stackSize > 1 : false;
  const baseOpacity = !isTop && hasStack ? 0.9 : 1;
  const baseScale = !isTop && hasStack ? 0.98 : 1;

  React.useEffect(() => {
    const hidden = getHiddenValues(resolvedAnimation);
    const visibleValues = getVisibleValues();
    const easingFn = resolveEasing(easing);

    const prevVisible = prevVisibleRef.current;
    if (prevVisible === visible) {
      return;
    }
    prevVisibleRef.current = visible;

    animationRef.current?.stop();

    if (resolvedAnimation === "none") {
      if (!visible) {
        onExited?.();
      } else {
        opacity.setValue(visibleValues.opacity);
        scale.setValue(visibleValues.scale);
        translateY.setValue(visibleValues.translateY);
      }
      return;
    }

    if (visible) {
      opacity.setValue(hidden.opacity);
      scale.setValue(hidden.scale);
      translateY.setValue(hidden.translateY);
      const enterOpacity = Animated.timing(opacity, {
        toValue: visibleValues.opacity,
        duration: durationMs,
        easing: easingFn,
        useNativeDriver: true
      });
      const enterScale = Animated.timing(scale, {
        toValue: visibleValues.scale,
        duration: durationMs,
        easing: easingFn,
        useNativeDriver: true
      });
      const enterTranslate = Animated.timing(translateY, {
        toValue: visibleValues.translateY,
        duration: durationMs,
        easing: easingFn,
        useNativeDriver: true
      });
      Animated.parallel([enterOpacity, enterScale, enterTranslate]).start();
      return;
    }

    const exitOpacity = Animated.timing(opacity, {
      toValue: hidden.opacity,
      duration: durationMs,
      easing: easingFn,
      useNativeDriver: true
    });
    const exitScale = Animated.timing(scale, {
      toValue: hidden.scale,
      duration: durationMs,
      easing: easingFn,
      useNativeDriver: true
    });
    const exitTranslate = Animated.timing(translateY, {
      toValue: hidden.translateY,
      duration: durationMs,
      easing: easingFn,
      useNativeDriver: true
    });

    Animated.parallel([exitOpacity, exitScale, exitTranslate]).start(() => {
      onExited?.();
    });
  }, [
    durationMs,
    easing,
    onExited,
    opacity,
    scale,
    translateY,
    resolvedAnimation,
    visible
  ]);

  if (resolvedAnimation === "none") {
    if (!visible) {
      return null;
    }
    const baseStyle =
      baseOpacity !== 1 || baseScale !== 1
        ? { opacity: baseOpacity, transform: [{ scale: baseScale }] }
        : undefined;
    return (
      <View style={[style, baseStyle]}>
        {children}
      </View>
    );
  }

  const containerStyle = {
    opacity: Animated.multiply(opacity, baseOpacity),
    transform: [{ translateY }, { scale: Animated.multiply(scale, baseScale) }]
  };

  return (
    <Animated.View
      pointerEvents={visible ? "box-none" : "none"}
      style={[containerStyle, style]}
    >
      {children}
    </Animated.View>
  );
};
