import React from "react";
import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CreateClubScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Create Your Club</Text>
      <Text style={styles.desc}>
        Di sini nanti kamu bisa isi form untuk bikin klub baru.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#1C315E",
  },
  desc: {
    marginTop: 10,
    fontSize: 16,
    color: "gray",
  },
});
