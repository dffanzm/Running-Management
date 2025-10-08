import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  // Loading spinner saat font belum siap
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Background retro */}
      <ImageBackground
        source={{
          uri: "https://i.ibb.co/vq4kKc1/pixel-background.gif",
        }}
        resizeMode="cover"
        style={styles.bgImage}
      >
        {/* Teks utama */}
        <Animatable.Text
          animation="fadeInDown"
          duration={1000}
          style={styles.title}
        >
          SELAMAT DATANG
        </Animatable.Text>

        {/* Subjudul */}
        <Animatable.Text
          animation="fadeInUp"
          delay={400}
          style={styles.subtitle}
        >
          RunAnywhere{"\n"}
          <Text style={{ color: "#38bdf8" }}>
            lari dimana saja, kapan saja!
          </Text>
        </Animatable.Text>

        {/* Tombol Lanjut */}
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          delay={1000}
        >
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/next")}
          >
            <Text style={styles.buttonText}>Tekan untuk Lanjut ➡</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Animasi Mario vs Bowser */}
        <Animatable.View
          animation="fadeInUp"
          delay={1500}
          style={styles.pixelContainer}
        >
          <Image
            source={{
              uri: "https://media.tenor.com/Pe2zphsAcL0AAAAC/mario-vs-bowser.gif",
            }}
            style={styles.pixelFight}
          />
        </Animatable.View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  bgImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  title: {
    color: "#facc15",
    fontSize: 30,
    fontFamily: "Poppins_700Bold",
    marginBottom: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#38bdf8",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 6,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Poppins_600SemiBold",
    fontSize: 16,
  },
  pixelContainer: {
    marginTop: 60,
    alignItems: "center",
  },
  pixelFight: {
    width: 250,
    height: 120,
    resizeMode: "contain",
  },
});
