import { Stack, usePathname } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";
import BottomNavbar from "./BottomNavbar";

export default function RootLayout() {
  const pathname = usePathname();

  // Halaman yang tidak menampilkan navbar
  const hideNavbarRoutes = ["/Welcome", "/Login", "/Register"];

  const shouldHideNavbar = hideNavbarRoutes.includes(pathname);

  return (
    <View style={styles.container}>
      {/* Bagian halaman utama */}
      <View
        style={[styles.pageContainer, shouldHideNavbar && { paddingBottom: 0 }]}
      >
        <Stack screenOptions={{ headerShown: false }} />
      </View>

      {/* Navbar hanya muncul jika bukan di halaman yang disembunyikan */}
      {!shouldHideNavbar && <BottomNavbar />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pageContainer: {
    flex: 1,
    paddingBottom: 70, // ruang untuk navbar
  },
});
