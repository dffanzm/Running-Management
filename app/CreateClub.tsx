// CreateClub.tsx
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const CreateClub: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Create Club Screen (Masih Kosong)</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  text: {
    fontSize: 20,
    color: "gray",
  },
});

export default CreateClub;
