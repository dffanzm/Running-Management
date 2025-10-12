import {
  Urbanist_400Regular,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- Warna utama dan style global ---
const PRIMARY_COLOR = "#1C315E";
const INACTIVE_COLOR = "gray";
const BUTTON_COLOR = "#112952";

// ==========================================================
// SECTION 1
// ==========================================================
const TopSection: React.FC = () => {
  const { height } = useWindowDimensions();
  const imageSource = require("../assets/HOMECOACH.jpg");

  return (
    <SafeAreaView
      style={[styles.topSectionContainer, { height: height * 0.35 }]}
    >
      <ImageBackground
        source={imageSource}
        style={styles.imageBackground}
        resizeMode="cover"
      >
        <View style={styles.overlayContainer}>
          <Text style={styles.welcomeText}>Welcome,{"\n"}Coach!</Text>
          {/* --- Gradient Fade ke Putih di bawah ---
          <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.8)", "#fff"]}
            style={styles.gradientFade}
          /> */}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// ==========================================================
// SECTION 2 — BTN "CREATE YOUR CLUB"
// ==========================================================
const CreateClubButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => router.push("/CreateClub")}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.createClubButton,
        isHovered && { opacity: 0.85, transform: [{ scale: 1.02 }] },
      ]}
    >
      <Text style={styles.createClubText}>CREATE YOUR CLUB</Text>
    </Pressable>
  );
};

// ==========================================================
// SECTION 3 — Bottom Navbar
// ==========================================================
const BottomNavbar: React.FC = () => {
  return (
    <View style={styles.navbarContainer}>
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => console.log("Home")}
      >
        <Ionicons name="home" size={26} color={PRIMARY_COLOR} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/Calendar")}
      >
        <Ionicons name="calendar-outline" size={26} color={INACTIVE_COLOR} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => console.log("Club")}
      >
        <Ionicons name="star-outline" size={26} color={INACTIVE_COLOR} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => console.log("Profile")}
      >
        <Ionicons name="person-outline" size={26} color={INACTIVE_COLOR} />
      </TouchableOpacity>
    </View>
  );
};

// ==========================================================
// MAIN APP
// ==========================================================
export default function App() {
  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Memuat Font...</Text>
      </View>
    );
  }

  return (
    <View style={styles.appContainer}>
      {/* SECTION 1: Foto + teks sambutan */}
      <View style={styles.contentWrapper}>
        <TopSection />

        {/* SECTION 2: Tombol utama */}
        <View style={styles.middleSection}>
          <CreateClubButton />
        </View>

        {/* Ruang kosong di bawah */}
        <View style={styles.remainingContent} />
      </View>
    </View>
  );
}

// ==========================================================
// STYLE
// ==========================================================
const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  contentWrapper: {
    flex: 1,
  },
  remainingContent: {
    flex: 1,
    backgroundColor: "white",
  },

  // SECTION 1 — Foto + teks
  topSectionContainer: {
    width: "100%",
    overflow: "hidden",
  },
  imageBackground: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "flex-end",
  },
  overlayContainer: {
    flex: 1,
    justifyContent: "flex-end",
    position: "relative",
  },
  welcomeText: {
    marginLeft: 23,
    marginBottom: 50,
    color: "white",
    fontSize: 40,
    fontFamily: "Urbanist-Bold",
    lineHeight: 44,
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1.5, height: 1.5 },
    textShadowRadius: 3,
    zIndex: 2,
  },

  // SECTION 2 — Tombol utama
  middleSection: {
    alignItems: "center",
    marginTop: 30,
  },
  createClubButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    transitionDuration: "200ms", // hanya aktif di web
  },
  createClubText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
    letterSpacing: 1,
  },

  // SECTION 3 — Bottom Navbar
  navbarContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    height: 70,
    paddingBottom: 5,
  },
  navItem: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
