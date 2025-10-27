import { Stack, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavbar from "./BottomNavbar";

export default function RootLayout() {
  const pathname = usePathname();
  const hideNavbarRoutes = ["/Welcome", "/Login", "/Register", "/CekEmail"];
  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View
          style={[
            styles.pageContainer,
            shouldHideNavbar && { marginBottom: 0 },
          ]}
        >
          <Stack screenOptions={{ headerShown: false }} />
        </View>

        {!shouldHideNavbar && <BottomNavbar />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
