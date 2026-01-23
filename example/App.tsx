import "react-native-gesture-handler";
import * as React from "react";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator, StackScreenProps } from "@react-navigation/stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import {
  NavigationOverlayHost,
  NavigationOverlayProvider,
  type TooltipAnchorRef,
  useOverlay,
} from "rn-overlay-manager";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type View as ViewType,
} from "react-native";

type OverviewStackParamList = {
  Overview: undefined;
  Details: undefined;
};

type RootTabParamList = {
  Overview: undefined;
  Toasts: undefined;
  Tooltips: undefined;
};

const animationOptions = [
  "fade",
  "scale",
  "slide-up",
  "slide-down",
  "none",
] as const;
type AnimationOption = (typeof animationOptions)[number];

const getAnimationDuration = (animation: AnimationOption) => {
  if (animation === "none") {
    return undefined;
  }
  if (animation === "slide-up" || animation === "slide-down") {
    return 320;
  }
  if (animation === "scale") {
    return 260;
  }
  return 220;
};

type OverviewScreenProps = StackScreenProps<
  OverviewStackParamList,
  "Overview"
>;
type DetailsScreenProps = StackScreenProps<
  OverviewStackParamList,
  "Details"
>;

type NavigationContainerRefLike = {
  addListener?: (
    event: "state",
    callback: () => void,
  ) => { remove: () => void } | (() => void);
  getCurrentRoute?: () => { key?: string; name?: string } | undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<OverviewStackParamList>();

const OutlineButton = ({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) => (
  <Pressable onPress={onPress} style={styles.button}>
    <Text style={styles.buttonText}>{label}</Text>
  </Pressable>
);

const Card = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    <View style={styles.cardBody}>{children}</View>
  </View>
);

const OverviewScreen = ({ navigation }: OverviewScreenProps) => {
  const overlay = useOverlay();
  const [modalAnimation, setModalAnimation] =
    React.useState<AnimationOption>("scale");

  const showScreenModal = () => {
    overlay.modal({
      scope: "screen",
      dismissible: true,
      backdrop: "dim",
      animation: modalAnimation,
      animationDurationMs: getAnimationDuration(modalAnimation),
      render: (api) => (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Screen-scoped modal</Text>
            <Text style={styles.modalText}>
              Navigate away and this modal will disappear.
            </Text>
            <OutlineButton label="Close" onPress={api.hide} />
          </View>
        </View>
      ),
    });
  };

  const showBottomModal = () => {
    overlay.modal({
      dismissible: true,
      backdrop: "dim",
      insets: "safeArea+tabBar",
      animation: modalAnimation,
      animationDurationMs: getAnimationDuration(modalAnimation),
      render: (api) => (
        <View style={styles.bottomModalContainer}>
          <View style={styles.bottomModalCard}>
            <Text style={styles.bottomModalTitle}>Bottom modal</Text>
            <Text style={styles.bottomModalText}>
              Uses safeArea+tabBar (tabBarHeight=60).
            </Text>
            <OutlineButton label="Got it" onPress={api.hide} />
          </View>
        </View>
      ),
    });
  };

  const showKeyboardModal = () => {
    overlay.modal({
      dismissible: true,
      backdrop: "dim",
      avoidKeyboard: true,
      animation: modalAnimation,
      animationDurationMs: getAnimationDuration(modalAnimation),
      render: (api) => (
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Keyboard modal</Text>
            <Text style={styles.modalText}>Input should stay visible.</Text>
            <TextInput placeholder="Type here..." style={styles.input} />
            <OutlineButton label="Close" onPress={api.hide} />
          </View>
        </View>
      ),
    });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card title="Modal animation">
          <Text style={styles.hint}>Applies to modal + bottom modal.</Text>
          <View style={styles.segmented}>
            {animationOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setModalAnimation(option)}
                style={[
                  styles.segment,
                  modalAnimation === option && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    modalAnimation === option && styles.segmentTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>
        <Card title="Navigation scope">
          <Text style={styles.hint}>
            Animation: {modalAnimation} ({getAnimationDuration(modalAnimation) ?? 180}ms).
          </Text>
          <OutlineButton label="Show SCREEN modal" onPress={showScreenModal} />
          <OutlineButton
            label="Go to Details"
            onPress={() => navigation.navigate("Details")}
          />
        </Card>

        <Card title="Bottom modal">
          <Text style={styles.hint}>Demonstrates safeArea+tabBar padding.</Text>
          <OutlineButton label="Show bottom modal" onPress={showBottomModal} />
        </Card>

        <Card title="Keyboard avoidance">
          <Text style={styles.hint}>
            Animation: {modalAnimation} ({getAnimationDuration(modalAnimation) ?? 180}ms).
          </Text>
          <OutlineButton
            label="Show keyboard modal"
            onPress={showKeyboardModal}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const DetailsScreen = (_props: DetailsScreenProps) => {
  const overlay = useOverlay();
  const helpRef = React.useRef<ViewType | null>(null);
  const tooltipAnimation = "fade";

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <Text style={styles.cardTitle}>Details</Text>
        <Text style={styles.hint}>Tooltip anchored near the edge.</Text>
        <View style={styles.edgeRow}>
          <Text style={styles.edgeLabel}>Need help?</Text>
          <View ref={helpRef} collapsable={false}>
            <Pressable
              onPress={() =>
                overlay.tooltip({
                  anchorRef: helpRef as TooltipAnchorRef,
                  text: "Screen tooltip near the edge",
                  placement: "auto",
                  scope: "screen",
                  animation: tooltipAnimation,
                })
              }
              style={styles.helpButton}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const ToastsScreen = () => {
  const overlay = useOverlay();
  const [toastAnimation, setToastAnimation] =
    React.useState<AnimationOption>("slide-up");
  const toastDuration = getAnimationDuration(toastAnimation);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card title="Toast animation">
          <Text style={styles.hint}>
            Applies to all toast demos ({toastDuration ?? 180}ms).
          </Text>
          <View style={styles.segmented}>
            {animationOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setToastAnimation(option)}
                style={[
                  styles.segment,
                  toastAnimation === option && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    toastAnimation === option && styles.segmentTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
          <OutlineButton
            label="Show global toast"
            onPress={() =>
              overlay.toast({
                message: "Global toast (persists across tabs)",
                placement: "bottom",
                durationMs: 3000,
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              })
            }
          />
        </Card>

        <Card title="Quick toast">
          <Text style={styles.hint}>Default style and bottom placement.</Text>
          <OutlineButton
            label="Show quick toast"
            onPress={() =>
              overlay.toast({
                message: "Quick toast",
                placement: "bottom",
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              })
            }
          />
        </Card>

        <Card title="Custom toast">
          <Text style={styles.hint}>Custom colors and rounded corners.</Text>
          <OutlineButton
            label="Show custom toast"
            onPress={() =>
              overlay.toast({
                message: "Custom toast",
                placement: "bottom",
                backgroundColor: "#0F172A",
                textStyle: { color: "#F8FAFC", fontWeight: "700" },
                toastStyle: { borderRadius: 14 },
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              })
            }
          />
        </Card>

        <Card title="Top toast">
          <Text style={styles.hint}>Shows in the top safe area.</Text>
          <OutlineButton
            label="Show top toast"
            onPress={() =>
              overlay.toast({
                message: "Top toast",
                placement: "top",
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              })
            }
          />
        </Card>

        <Card title="Queue toasts">
          <Text style={styles.hint}>Shows three toasts sequentially.</Text>
          <OutlineButton
            label="Queue 3 toasts"
            onPress={() => {
              overlay.toast({
                message: "Queued 1",
                placement: "bottom",
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              });
              overlay.toast({
                message: "Queued 2",
                placement: "bottom",
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              });
              overlay.toast({
                message: "Queued 3",
                placement: "bottom",
                animation: toastAnimation,
                animationDurationMs: toastDuration,
              });
            }}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const TooltipsScreen = () => {
  const overlay = useOverlay();
  const edgeRef = React.useRef<ViewType | null>(null);
  const customRef = React.useRef<ViewType | null>(null);
  const [tooltipAnimation, setTooltipAnimation] =
    React.useState<AnimationOption>("fade");
  const tooltipDuration = getAnimationDuration(tooltipAnimation);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Card title="Animation preset">
          <Text style={styles.hint}>
            Applies to all tooltips ({tooltipDuration ?? 180}ms).
          </Text>
          <View style={styles.segmented}>
            {animationOptions.map((option) => (
              <Pressable
                key={option}
                onPress={() => setTooltipAnimation(option)}
                style={[
                  styles.segment,
                  tooltipAnimation === option && styles.segmentActive,
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    tooltipAnimation === option && styles.segmentTextActive,
                  ]}
                >
                  {option}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card title="Edge tooltip">
          <Text style={styles.hint}>
            Anchored near the edge to test clamping.
          </Text>
          <View style={styles.edgeRow}>
            <Text style={styles.edgeLabel}>Help</Text>
            <View ref={edgeRef} collapsable={false}>
              <Pressable
                onPress={() =>
                  overlay.tooltip({
                    anchorRef: edgeRef as TooltipAnchorRef,
                    text: "Default tooltip near the edge",
                    placement: "auto",
                    animation: tooltipAnimation,
                    animationDurationMs: tooltipDuration,
                  })
                }
                style={styles.helpButton}
              >
                <Text style={styles.helpButtonText}>?</Text>
              </Pressable>
            </View>
          </View>
        </Card>

        <Card title="Custom tooltip">
          <Text style={styles.hint}>Custom render override.</Text>
          <View ref={customRef} collapsable={false}>
            <OutlineButton
              label="Show custom tooltip"
                onPress={() =>
                  overlay.tooltip({
                    anchorRef: customRef as TooltipAnchorRef,
                    placement: "bottom",
                    animation: tooltipAnimation,
                    animationDurationMs: tooltipDuration,
                    render: (api) => (
                      <View style={styles.customTooltip}>
                        <Text style={styles.customTooltipTitle}>
                          Custom tooltip
                        </Text>
                      <Text style={styles.customTooltipText}>
                        Fully custom UI rendered by your app.
                      </Text>
                      <OutlineButton label="Close" onPress={api.hide} />
                    </View>
                  ),
                })
              }
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const OverviewStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Overview" component={OverviewScreen} />
    <Stack.Screen name="Details" component={DetailsScreen} />
  </Stack.Navigator>
);

const RootTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: { height: 60, paddingBottom: 8 },
      tabBarActiveTintColor: "#0F172A",
      headerShown: false,
    }}
  >
    <Tab.Screen name="Overview" component={OverviewStack} />
    <Tab.Screen name="Toasts" component={ToastsScreen} />
    <Tab.Screen name="Tooltips" component={TooltipsScreen} />
  </Tab.Navigator>
);

export default function App() {
  const navigationRef = useNavigationContainerRef();
  const overlayNavigationRef =
    navigationRef as unknown as React.RefObject<NavigationContainerRefLike | null>;

  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <SafeAreaProvider>
        <NavigationOverlayProvider
          navigationRef={overlayNavigationRef}
          tabBarHeight={60}
        >
          <NavigationContainer ref={navigationRef}>
            <RootTabs />
          </NavigationContainer>
          <NavigationOverlayHost />
        </NavigationOverlayProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  screen: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  content: {
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  cardBody: {
    gap: 10,
  },
  segmented: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  segment: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  segmentActive: {
    backgroundColor: "#0F172A",
    borderColor: "#0F172A",
  },
  segmentText: {
    fontSize: 12,
    color: "#0F172A",
  },
  segmentTextActive: {
    color: "#F8FAFC",
  },
  hint: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 6,
  },
  button: {
    borderWidth: 1,
    borderColor: "#0F172A",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#0F172A",
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    width: "100%",
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  bottomModalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 16,
  },
  bottomModalCard: {
    width: "100%",
    backgroundColor: "#0F172A",
    borderRadius: 16,
    padding: 18,
  },
  bottomModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  bottomModalText: {
    fontSize: 14,
    color: "#CBD5F5",
    marginBottom: 12,
  },
  edgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  edgeLabel: {
    fontSize: 15,
    color: "#0F172A",
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  customTooltip: {
    backgroundColor: "#0F172A",
    padding: 14,
    borderRadius: 12,
    width: 240,
  },
  customTooltipTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F8FAFC",
    marginBottom: 6,
  },
  customTooltipText: {
    fontSize: 13,
    color: "#CBD5F5",
    marginBottom: 8,
  },
});
