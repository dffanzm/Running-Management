import {
  Urbanist_400Regular,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { router } from "expo-router";
import React from "react";
import {
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BUTTON_COLOR = "#112952";
const HIGHLIGHT_COLOR = "#618db8ff";
const imageSource = require("../assets/Welcome.jpg");

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
  });

  // logic biar di semua device aman font size
  const { width } = useWindowDimensions();
  const fontSize = Math.max(24, Math.min(width * 0.08, 40));

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: "#fff" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <ImageBackground
        source={imageSource}
        style={styles.background}
        resizeMode="cover"
        blurRadius={2}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.safeArea}>
            {/* SECTION 1: Text */}
            <View style={styles.section1}>
              <Text style={[styles.welcomeText, { fontSize }]}>
                Welcome to{"\n"}
                <Text style={{ color: HIGHLIGHT_COLOR }}>RunEase</Text>
              </Text>
            </View>

            {/* SECTION 2: Buttons */}
            <View style={styles.section2}>
              <HoverButton
                text="Login"
                filled
                onPress={() => router.push("/Login")}
              />
              <HoverButton
                text="Register"
                onPress={() => router.push("/Register")}
              />
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>
    </View>
  );
}

// Komponen tombol dengan efek hover & press
type HoverButtonProps = {
  text: string;
  filled?: boolean;
  onPress: () => void;
};

const HoverButton: React.FC<HoverButtonProps> = ({
  text,
  filled = false,
  onPress,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isPressed, setIsPressed] = React.useState(false);

  const buttonStyle = [
    styles.baseButton,
    filled
      ? { backgroundColor: BUTTON_COLOR, borderWidth: 0 }
      : { borderWidth: 1.5, borderColor: "#fff" },
    (isHovered || isPressed) && {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
  ];

  const textStyle = [
    styles.baseText,
    filled ? { color: "#fff" } : { color: "#fff" },
  ];

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      style={buttonStyle}
    >
      <Text style={textStyle}>{text}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "space-between",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Platform.OS === "web" ? 100 : 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  section1: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  welcomeText: {
    fontFamily: "Urbanist-Bold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 42,
  },
  section2: {
    alignItems: "center",
    width: "100%",
    marginBottom: 40,
    gap: 16,
  },
  baseButton: {
    width: "80%",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    transitionDuration: "200ms",
  },
  baseText: {
    fontFamily: "Urbanist-Bold",
    fontSize: 16,
  },
});
