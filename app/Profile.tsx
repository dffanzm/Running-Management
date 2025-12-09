import React, { useEffect, useState } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from "expo-router";

// --- Warna Utama ---
const PRIMARY_COLOR = "#1C315E";
const INACTIVE_COLOR = "gray";
const BUTTON_COLOR = "#112952";
const AVATAR_BG_COLOR = "#E6EBF5"; // Warna background untuk inisial

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- AMBIL DATA SAAT HALAMAN DIBUKA ---
  useEffect(() => {
    const getUserData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem('userSession');
        if (jsonValue != null) {
          const user = JSON.parse(jsonValue);
          setUserData(user);
        }
      } catch (e) {
        console.error("Gagal mengambil data user", e);
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, []);

  // --- FUNGSI LOGOUT ---
  const handleLogout = () => {
    Alert.alert("Log Out", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { 
        text: "Ya, Keluar", 
        onPress: async () => {
          await AsyncStorage.removeItem('userSession');
          router.replace("/Login");
        } 
      },
    ]);
  };

  // --- Helper: Ambil Inisial Huruf Depan ---
  const getInitial = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  // Jika data user kosong
  if (!userData) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Silakan Login terlebih dahulu.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        
        {/* --- Avatar Inisial (Tanpa Gambar) --- */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {getInitial(userData.username)}
            </Text>
          </View>
        </View>

        {/* --- Info User --- */}
        <Text style={styles.username}>{userData.username}</Text>
        <Text style={styles.email}>{userData.email}</Text>

        {/* --- Garis Pembatas --- */}
        <View style={styles.divider} />

        {/* --- Tombol Log Out --- */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: -50, // Sedikit naik ke atas biar pas di tengah visual
  },
  avatarContainer: {
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60, // Bulat sempurna
    backgroundColor: AVATAR_BG_COLOR,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: PRIMARY_COLOR,
  },
  avatarText: {
    fontSize: 50,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },
  username: {
    fontSize: 26,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 5,
    textAlign: "center",
    textTransform: "capitalize", // Huruf depan otomatis besar
  },
  email: {
    fontSize: 16,
    color: INACTIVE_COLOR,
    marginBottom: 40,
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#E0E0E0",
    marginBottom: 40,
  },
  logoutButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 14,
    width: "100%",
    alignItems: "center",
    shadowColor: BUTTON_COLOR,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});