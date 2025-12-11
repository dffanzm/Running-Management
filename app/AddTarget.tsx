import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../Database/supabaseClient";
import { Calendar } from "react-native-calendars";

const PRIMARY_COLOR = "#1C315E";
const BUTTON_COLOR = "#112952";
const INPUT_BG = "#F9FAFB";

export default function AddTargetScreen() {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !value || !deadline) {
      Alert.alert("Data Kurang", "Mohon isi Judul, Target, dan Tanggal Deadline.");
      return;
    }

    setLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      const userData = JSON.parse(jsonValue || "{}");

      // Simpan ke database
      const { error } = await supabase
        .from("training_targets")
        .insert([
          {
            athlete_id: userData.id,
            title: title,
            target_value: value,
            deadline: deadline,
            status: "pending" // Default menunggu ACC Coach
          }
        ]);

      if (error) throw error;

      Alert.alert("Berhasil", "Target telah dibuat dan dikirim ke Coach untuk disetujui.", [
        { text: "OK", onPress: () => router.replace("/Home") }
      ]);

    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan sistem.");
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
        <Text style={styles.headerTitle}>Buat Target Baru</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          
          <Text style={styles.subTitle}>Apa tujuan latihanmu selanjutnya?</Text>

          {/* Input Judul */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Judul Target</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Borobudur Marathon"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Input Nilai Target */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Detail Target (Jarak/Waktu)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Finish under 4 jam"
              value={value}
              onChangeText={setValue}
            />
          </View>

          {/* Input Deadline */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Target Tercapai Pada</Text>
            <TouchableOpacity 
              style={[styles.input, {justifyContent: 'center'}]}
              onPress={() => setShowCalendar(!showCalendar)}
            >
              <Text style={{color: deadline ? "#000" : "gray"}}>
                {deadline || "Pilih Tanggal"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="gray" style={{position: 'absolute', right: 15}} />
            </TouchableOpacity>
          </View>

          {/* Kalender Popup */}
          {showCalendar && (
            <View style={{marginBottom: 20}}>
              <Calendar
                onDayPress={(day: any) => {
                  setDeadline(day.dateString);
                  setShowCalendar(false);
                }}
                markedDates={{ [deadline]: { selected: true, selectedColor: PRIMARY_COLOR } }}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Ajukan Target</Text>}
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
  subTitle: { fontSize: 16, color: "gray", marginBottom: 25 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 8 },
  input: { backgroundColor: INPUT_BG, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 15, fontSize: 16, color: "#111827" },
  submitButton: { backgroundColor: BUTTON_COLOR, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 10, elevation: 5 },
  disabledButton: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});