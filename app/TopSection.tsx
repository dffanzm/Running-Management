// TopSection.tsx
import React from "react";
import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const TopSection: React.FC = () => {
  const { height } = useWindowDimensions(); // supaya responsif
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
          --- Gradient Fade ke Putih di bawah ---
          {/* <LinearGradient
            colors={["transparent", "rgba(255,255,255,0.8)", "#fff"]}
            style={styles.gradientFade}
          /> */}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // --- Container utama section ---
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

  //   // --- Gradient lembut ke bawah ---
  //   gradientFade: {
  //     position: "absolute",
  //     bottom: 0,
  //     left: 0,
  //     right: 0,
  //     height: "7.6%",
  //     zIndex: 1,
  //   },
});

export default TopSection;
