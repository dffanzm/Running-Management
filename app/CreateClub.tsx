import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

// --- WARNA TEMA ---
const PRIMARY_COLOR = "#1C315E";
const BUTTON_COLOR = "#112952";
const INPUT_BG = "#F9FAFB";

export default function CreateClubScreen() {
  const [clubName, setClubName] = useState("");
  const [domicile, setDomicile] = useState("");
  const [coachName, setCoachName] = useState(""); // Opsional: Bisa input manual atau ambil dari username
  const [loading, setLoading] = useState(false);

  // --- FUNGSI SUBMIT ---
  const handleCreate = async () => {
    // 1. Validasi Input
    if (!clubName.trim() || !domicile.trim() || !coachName.trim()) {
      Alert.alert("Data Belum Lengkap", "Mohon isi semua kolom (Nama Klub, Nama Coach, Domisili).");
      return;
    }

    setLoading(true);

    try {
      // 2. Ambil ID User yang sedang login
      const jsonValue = await AsyncStorage.getItem("userSession");
      if (!jsonValue) {
        Alert.alert("Error", "Sesi berakhir, silakan login ulang.");
        router.replace("/Login");
        return;
      }
      const userData = JSON.parse(jsonValue);

      // 3. Masukkan ke Database Supabase
      const { error } = await supabase
        .from("clubs")
        .insert([
          {
            user_id: userData.id,       // FK: Siapa yang bikin
            club_name: clubName,
            coach_name: coachName,
            domicile: domicile,
            // logo_url: null (Nanti saja fiturnya)
          },
        ]);

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      // 4. Sukses! Kembali ke Home
      Alert.alert("Berhasil!", "Klub lari Anda telah berhasil dibuat.", [
        { 
          text: "Mulai Melatih", 
          onPress: () => {
            // Kita pakai 'replace' supaya gak bisa back ke halaman form ini
            router.replace("/Home"); 
          }
        }
      ]);

    } catch (err) {
      console.error(err);
      Alert.alert("Gagal Membuat Klub", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Header Sederhana */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Create New Club</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.subTitle}>
              Bangun komunitas larimu sendiri. Kelola atlet dan program latihan dalam satu tempat.
            </Text>

            {/* Input Nama Klub */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Klub</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Bandung Runners Elite"
                placeholderTextColor="gray"
                value={clubName}
                onChangeText={setClubName}
              />
            </View>

            {/* Input Nama Coach (Display Name) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nama Coach (Panggilan)</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Coach Budi"
                placeholderTextColor="gray"
                value={coachName}
                onChangeText={setCoachName}
              />
            </View>

            {/* Input Domisili */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Domisili / Kota</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Bandung, Jawa Barat"
                placeholderTextColor="gray"
                value={domicile}
                onChangeText={setDomicile}
              />
            </View>

            {/* Tombol Submit */}
            <TouchableOpacity
              style={[styles.submitButton, loading && styles.disabledButton]}
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Create Club</Text>
              )}
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row", alignItems: "center",
    padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6"
  },
  backBtn: { paddingRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: PRIMARY_COLOR },
  
  formContainer: { padding: 24 },
  subTitle: { fontSize: 14, color: "gray", marginBottom: 30, lineHeight: 20 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 8 },
  input: {
    backgroundColor: INPUT_BG,
    borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12,
    padding: 15, fontSize: 16, color: "#111827"
  },
  
  submitButton: {
    backgroundColor: BUTTON_COLOR,
    paddingVertical: 16, borderRadius: 12,
    alignItems: "center", marginTop: 20,
    shadowColor: BUTTON_COLOR, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 5, elevation: 5
  },
  disabledButton: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});