import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const forgotPassword = () => {
  return (
    <SafeAreaView style={{ flex: 1, padding: 20, paddingTop: 40 }}>
      <View style={styles.header}>
        <Text style={styles.title}>....................</Text>
      </View>

      <View>
        <Text style={styles.KONTOL}>cOPILOT GACOR JANG</Text>
      </View>
    </SafeAreaView>
  );
};

export default forgotPassword;

// --- Styles ---
const styles = StyleSheet.create({
  KONTOL: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  header: {
    marginBottom: 20,
  },
});
