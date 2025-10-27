import {
  Urbanist_400Regular,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Achievements() {
  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Font...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Achievements</Text>
      <Text style={styles.subtitle}>
        Your trophies and milestones will be shown here.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist-Bold",
    color: "#1C315E",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Urbanist-Regular",
    color: "gray",
  },
});
