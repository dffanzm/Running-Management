import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../Database/supabaseClient";

const PRIMARY_COLOR = "#1C315E";
const BUTTON_COLOR = "#112952";
const INPUT_BG = "#F9FAFB";

export default function EditProfileScreen() {
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      if (jsonValue) {
        const user = JSON.parse(jsonValue);
        setUserId(user.id);
        setUsername(user.username);
        setEmail(user.email); // Email biasanya tidak diubah
        setGender(user.gender || "");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async () => {
    if (!username.trim()) {
      Alert.alert("Error", "Username tidak boleh kosong.");
      return;
    }

    setLoading(true);
    try {
      // 1. Update ke Supabase
      const { data, error } = await supabase
        .from("users")
        .update({ 
          username: username,
          gender: gender
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      // 2. Update Session di HP (PENTING: Biar nama di Home langsung berubah)
      // Kita perlu merge data lama dengan data baru
      const jsonValue = await AsyncStorage.getItem("userSession");
      const oldSession = JSON.parse(jsonValue || "{}");
      const newSession = { ...oldSession, ...data };
      
      await AsyncStorage.setItem("userSession", JSON.stringify(newSession));

      Alert.alert("Berhasil", "Profil berhasil diperbarui!", [
        { text: "OK", onPress: () => router.back() } // Kembali ke Profile
      ]);

    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          {/* Avatar Besar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
            </View>
          </View>

          {/* Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Tidak dapat diubah)</Text>
            <TextInput
              style={[styles.input, {backgroundColor: '#e5e7eb', color: '#6b7280'}]}
              value={email}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity 
                style={[styles.genderBtn, gender === 'Man' && styles.genderBtnActive]}
                onPress={() => setGender('Man')}
              >
                <Ionicons name="male" size={20} color={gender === 'Man' ? 'white' : 'gray'} />
                <Text style={[styles.genderText, gender === 'Man' && styles.genderTextActive]}>Laki-laki</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.genderBtn, gender === 'Woman' && styles.genderBtnActive]}
                onPress={() => setGender('Woman')}
              >
                <Ionicons name="female" size={20} color={gender === 'Woman' ? 'white' : 'gray'} />
                <Text style={[styles.genderText, gender === 'Woman' && styles.genderTextActive]}>Perempuan</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, loading && {opacity: 0.7}]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Simpan Perubahan</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 15, color: PRIMARY_COLOR },
  
  avatarContainer: { alignItems: 'center', marginBottom: 30 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: PRIMARY_COLOR },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: PRIMARY_COLOR },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 8 },
  input: { backgroundColor: INPUT_BG, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 15, fontSize: 16, color: "#111827" },
  
  genderRow: { flexDirection: 'row', gap: 15 },
  genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: INPUT_BG, gap: 8 },
  genderBtnActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  genderText: { fontWeight: 'bold', color: 'gray' },
  genderTextActive: { color: 'white' },

  saveButton: { backgroundColor: BUTTON_COLOR, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 20, elevation: 5 },
  saveText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});
