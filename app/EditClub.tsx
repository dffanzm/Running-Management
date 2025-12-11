import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../Database/supabaseClient";

const PRIMARY_COLOR = "#1C315E";
const BUTTON_COLOR = "#112952";

export default function EditClubScreen() {
  const [clubId, setClubId] = useState<string | null>(null);
  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchClubData();
  }, []);

  const fetchClubData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      if (!jsonValue) return;
      const userData = JSON.parse(jsonValue);

      // Ambil data klub saat ini
      const { data, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("user_id", userData.id)
        .single();

      if (error) throw error;
      if (data) {
        setClubId(data.id);
        setClubName(data.club_name); // Isi input dengan nama lama
      }
    } catch (err) {
      Alert.alert("Error", "Gagal mengambil data klub.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!clubName.trim()) {
      Alert.alert("Error", "Nama klub tidak boleh kosong.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("clubs")
        .update({ club_name: clubName }) // Update hanya nama klub
        .eq("id", clubId);

      if (error) throw error;

      Alert.alert("Sukses", "Nama klub berhasil diubah!", [
        { text: "OK", onPress: () => router.back() } // Kembali ke halaman Club
      ]);
    } catch (err) {
      Alert.alert("Gagal", "Terjadi kesalahan sistem.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{marginTop:50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Nama Klub</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Nama Klub Baru</Text>
        <TextInput
          style={styles.input}
          value={clubName}
          onChangeText={setClubName}
          placeholder="Masukkan nama baru..."
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Simpan Perubahan</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#eee" },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 15, color: PRIMARY_COLOR },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 10 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 15, fontSize: 16, marginBottom: 20 },
  saveBtn: { backgroundColor: BUTTON_COLOR, padding: 15, borderRadius: 12, alignItems: "center" },
  saveText: { color: "white", fontWeight: "bold", fontSize: 16 }
});