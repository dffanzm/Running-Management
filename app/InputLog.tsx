import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../Database/supabaseClient";

const PRIMARY_COLOR = "#1C315E";
const BUTTON_COLOR = "#112952";
const INPUT_BG = "#F9FAFB";

export default function InputLogScreen() {
  const params = useLocalSearchParams();
  const { planId, planTitle } = params; // Menerima ID Program dari Home

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [feeling, setFeeling] = useState("Baik");
  const [loading, setLoading] = useState(false);
  const [athleteId, setAthleteId] = useState<any>(null);

  useEffect(() => {
    getId();
  }, []);

  const getId = async () => {
    const jsonValue = await AsyncStorage.getItem("userSession");
    if (jsonValue) {
      const user = JSON.parse(jsonValue);
      setAthleteId(user.id);
    }
  };

  const handleSubmit = async () => {
    // 1. Validasi
    if (!distance || !duration) {
      Alert.alert("Data Kurang", "Mohon isi Jarak (KM) dan Durasi (Menit).");
      return;
    }

    setLoading(true);

    try {
      // 2. SIMPAN KE LOGS (Supaya masuk Riwayat & Statistik)
      // Kita gunakan parseFloat agar angka tersimpan sebagai angka, bukan teks
      const { error: logError } = await supabase
        .from("training_logs")
        .insert([
          {
            athlete_id: athleteId,
            plan_id: planId || null, 
            actual_distance: parseFloat(distance), 
            actual_duration: parseFloat(duration),
            notes: notes,
            feeling: feeling,
            date: new Date().toISOString().split('T')[0]
          }
        ]);

      if (logError) {
        console.error("Log Error:", logError);
        throw new Error("Gagal menyimpan log latihan.");
      }

      // 3. UPDATE STATUS PROGRAM (Supaya jadwal jadi Hijau/Completed)
      if (planId) {
        const { error: updateError } = await supabase
          .from("training_plans")
          .update({ status: "completed" })
          .eq("id", planId);

        if (updateError) {
           console.error("Plan Update Error:", updateError);
           // Kita tidak throw error di sini agar log tetap tersimpan walau status gagal update (jarang terjadi)
        }
      }

      // 4. Sukses -> Balik ke Home
      Alert.alert("Berhasil", "Latihan berhasil disimpan!", [
        { 
          text: "OK", 
          onPress: () => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/Home");
            }
          }
        }
      ]);

    } catch (err: any) {
      Alert.alert("Gagal", err.message || "Terjadi kesalahan sistem.");
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
        <Text style={styles.headerTitle}>Input Hasil Latihan</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          
          {/* Info Program */}
          {planTitle && (
            <View style={styles.programInfo}>
              <Text style={styles.infoLabel}>Program Latihan:</Text>
              <Text style={styles.infoTitle}>{planTitle}</Text>
            </View>
          )}

          {/* Input Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Jarak Tempuh (KM)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 5.2"
              keyboardType="numeric"
              value={distance}
              onChangeText={setDistance}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Durasi (Menit)</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: 45"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Perasaan Latihan</Text>
            <View style={styles.feelingContainer}>
              {['Sangat Baik', 'Baik', 'Buruk', 'Sangat Berat'].map((f) => (
                <TouchableOpacity 
                  key={f} 
                  style={[styles.feelBtn, feeling === f && styles.feelBtnActive]}
                  onPress={() => setFeeling(f)}
                >
                  <Text style={[styles.feelText, feeling === f && styles.feelTextActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Catatan</Text>
            <TextInput
              style={[styles.input, {height: 100, textAlignVertical: 'top'}]}
              placeholder="Ada kendala atau pencapaian?"
              multiline
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          <TouchableOpacity 
            style={[styles.submitBtn, loading && {opacity: 0.7}]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" /> : <Text style={styles.submitText}>Simpan Laporan</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#eee" },
  headerTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 15, color: PRIMARY_COLOR },
  
  programInfo: { backgroundColor: '#E0E7FF', padding: 15, borderRadius: 12, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: PRIMARY_COLOR },
  infoLabel: { fontSize: 12, color: PRIMARY_COLOR, marginBottom: 2 },
  infoTitle: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 8 },
  input: { backgroundColor: INPUT_BG, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 15, fontSize: 16 },
  
  feelingContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  feelBtn: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: 'white' },
  feelBtnActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  feelText: { color: 'gray', fontWeight: 'bold' },
  feelTextActive: { color: 'white' },

  submitBtn: { backgroundColor: BUTTON_COLOR, padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10, elevation: 3 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});