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
const PROGRESS_COLOR = "#1E40AF"; // biru untuk progress

// ==========================================================
// SECTION 1 — Foto & sambutan
// ==========================================================
const TopSectionAthlete: React.FC = () => {
  const { height } = useWindowDimensions();
  const imageSource = require("../assets/HOMECOACH.jpg"); // ganti sesuai gambar

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
          <Text style={styles.welcomeText}>Welcome,{"\n"}Athlete!</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

// ==========================================================
// SECTION 2 — BTN "JOIN A CLUB"
// ==========================================================
const JoinClubButton: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Pressable
      onPress={() => router.push("./JoinClub")} //      TAR GANTIIIIIIIIIIIIIIIIIIII CO
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.joinClubButton,
        isHovered && { opacity: 0.85, transform: [{ scale: 1.02 }] },
      ]}
    >
      <Text style={styles.joinClubText}>JOIN A CLUB</Text>
    </Pressable>
  );
};

// ==========================================================
// SECTION 3 — Progress Latihan
// ==========================================================
const TrainingProgress: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressHeader}>
        <Text style={styles.progressTitle}>Weekly Training Progress</Text>
        <Text style={styles.progressPercent}>{progress}%</Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
      </View>

      <Text style={styles.progressSubtext}>Keep up the great work!</Text>
    </View>
  );
};

// ==========================================================
// SECTION 4 — Bottom Navbar
// ==========================================================
const BottomNavbarAthlete: React.FC = () => {
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
        onPress={() => router.push("./Training")}
      >
        <Ionicons name="barbell-outline" size={26} color={INACTIVE_COLOR} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("./Achievements")}
      >
        <Ionicons name="trophy-outline" size={26} color={INACTIVE_COLOR} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        onPress={() => router.push("/Profile")}
      >
        <Ionicons name="person-outline" size={26} color={INACTIVE_COLOR} />
      </TouchableOpacity>
    </View>
  );
};

// ==========================================================
// MAIN APP — Home Athlete
// ==========================================================
export default function HomeAthlete() {
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

  // contoh progress (bisa diambil dari API nanti)
  const weeklyProgress = 72;

  return (
    <View style={styles.appContainer}>
      <View style={styles.contentWrapper}>
        {/* SECTION 1: Foto + sambutan */}
        <TopSectionAthlete />

        {/* SECTION 2: Tombol utama */}
        <View style={styles.middleSection}>
          <JoinClubButton />
        </View>

        {/* SECTION 3: Progress latihan */}
        <TrainingProgress progress={weeklyProgress} />

        {/* SECTION 4: Navbar bawah */}
        <BottomNavbarAthlete />
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
  },

  // SECTION 2 — Tombol utama
  middleSection: {
    alignItems: "center",
    marginTop: 30,
  },
  joinClubButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    transitionDuration: "200ms",
  },
  joinClubText: {
    color: "white",
    fontSize: 18,
    fontFamily: "Urbanist-Bold",
    letterSpacing: 1,
  },

  // SECTION 3 — Progress latihan
  progressContainer: {
    marginTop: 40,
    marginHorizontal: 30,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTitle: {
    fontFamily: "Urbanist-Bold",
    fontSize: 16,
    color: PRIMARY_COLOR,
  },
  progressPercent: {
    fontFamily: "Urbanist-Bold",
    fontSize: 16,
    color: PROGRESS_COLOR,
  },
  progressBarBackground: {
    width: "100%",
    height: 10,
    backgroundColor: "#E5E7EB",
    borderRadius: 6,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: PROGRESS_COLOR,
    borderRadius: 6,
  },
  progressSubtext: {
    marginTop: 6,
    fontFamily: "Urbanist-Regular",
    fontSize: 13,
    color: "gray",
  },

  // SECTION 4 — Navbar bawah
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
