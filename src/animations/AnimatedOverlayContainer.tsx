import * as React from "react";
import { Animated, Easing, type ViewStyle } from "react-native";
import type { OverlayAnimation, OverlayAnimationEasing } from "../types.js";

type AnimatedOverlayContainerProps = {
  visible: boolean;
  animation?: OverlayAnimation;
  durationMs?: number;
  easing?: OverlayAnimationEasing;
  onExited?: () => void;
  style?: ViewStyle;
  children: React.ReactNode;
};

const getHiddenValues = (animation: OverlayAnimation) => {
  switch (animation) {
    case "fade":
      return { opacity: 0, scale: 1, translateY: 0 };
    case "scale":
      return { opacity: 0, scale: 0.95, translateY: 0 };
    case "slide-up":
      return { opacity: 0, scale: 1, translateY: 12 };
    case "slide-down":
      return { opacity: 0, scale: 1, translateY: -12 };
    case "none":
    default:
      return { opacity: 1, scale: 1, translateY: 0 };
  }
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
  children
}: AnimatedOverlayContainerProps) => {
  const opacity = React.useRef(new Animated.Value(1)).current;
  const scale = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);

  React.useEffect(() => {
    const hidden = getHiddenValues(animation);
    const visibleValues = getVisibleValues();
    const easingFn = resolveEasing(easing);

    animationRef.current?.stop();

    if (animation === "none") {
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
      animationRef.current = Animated.timing(opacity, {
        toValue: visibleValues.opacity,
        duration: durationMs,
        easing: easingFn,
        useNativeDriver: true
      });
      const scaleAnim = Animated.timing(scale, {
        toValue: visibleValues.scale,
        duration: durationMs,
        easing: easingFn,
        useNativeDriver: true
      });
      const translateAnim = Animated.timing(translateY, {
        toValue: visibleValues.translateY,
        duration: durationMs,
        easing: easingFn,
        useNativeDriver: true
      });
      Animated.parallel([animationRef.current, scaleAnim, translateAnim]).start();
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
  }, [animation, durationMs, easing, onExited, opacity, scale, translateY, visible]);

  if (animation === "none" && !visible) {
    return null;
  }

  const containerStyle: ViewStyle = {
    opacity,
    transform: [{ translateY }, { scale }]
  } as unknown as ViewStyle;

  return (
    <Animated.View style={[containerStyle, style]}>
      {children}
    </Animated.View>
  );
};
