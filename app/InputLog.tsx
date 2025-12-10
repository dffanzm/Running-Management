import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
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

const PRIMARY_COLOR = "#1C315E";
const BUTTON_COLOR = "#112952";
const INPUT_BG = "#F9FAFB";

export default function InputLogScreen() {
  const params = useLocalSearchParams();
  const { planId, planTitle } = params; 

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [pace, setPace] = useState("");
  const [hr, setHr] = useState("");
  const [notes, setNotes] = useState("");
  const [feeling, setFeeling] = useState("Good"); 
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!distance || !duration) {
      Alert.alert("Data Kurang", "Mohon isi Jarak dan Durasi latihan.");
      return;
    }

    setLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      const userData = JSON.parse(jsonValue || "{}");

      const { error: logError } = await supabase
        .from("training_logs")
        .insert([{
            plan_id: planId,
            athlete_id: userData.id,
            actual_distance: parseFloat(distance),
            actual_duration: parseInt(duration),
            avg_pace: pace,
            avg_hr: parseInt(hr) || 0,
            feeling: feeling,
            notes: notes,
          }]);

      if (logError) throw logError;

      const { error: planError } = await supabase
        .from("training_plans")
        .update({ status: "completed" })
        .eq("id", planId);

      if (planError) throw planError;

      Alert.alert("Mantap!", "Laporan latihan berhasil dikirim!", [
        { text: "Kembali ke Home", onPress: () => router.replace("/Home") }
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
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex: 1}}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Lapor Hasil Latihan</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.subTitle}>Program: {planTitle}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jarak Tempuh (KM)</Text>
              <TextInput style={styles.input} placeholder="5.2" keyboardType="numeric" value={distance} onChangeText={setDistance} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Durasi (Menit)</Text>
              <TextInput style={styles.input} placeholder="30" keyboardType="numeric" value={duration} onChangeText={setDuration} />
            </View>

            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={[styles.inputGroup, {width: '48%'}]}>
                  <Text style={styles.label}>Avg Pace</Text>
                  <TextInput style={styles.input} placeholder="6:30" value={pace} onChangeText={setPace} />
                </View>
                <View style={[styles.inputGroup, {width: '48%'}]}>
                  <Text style={styles.label}>Avg HR</Text>
                  <TextInput style={styles.input} placeholder="145" keyboardType="numeric" value={hr} onChangeText={setHr} />
                </View>
            </View>

            <Text style={styles.label}>Bagaimana rasanya?</Text>
            <View style={styles.feelingContainer}>
               {['Great', 'Good', 'Bad'].map((feel) => (
                 <TouchableOpacity key={feel} style={[styles.feelBtn, feeling === feel && styles.feelBtnActive]} onPress={() => setFeeling(feel)}>
                    <FontAwesome5 name={feel === 'Great' ? 'grin-stars' : feel === 'Good' ? 'smile' : 'frown'} size={24} color={feeling === feel ? 'white' : 'gray'} />
                    <Text style={[styles.feelText, feeling === feel && {color: 'white'}]}>{feel}</Text>
                 </TouchableOpacity>
               ))}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Catatan</Text>
              <TextInput style={[styles.input, {height: 80, textAlignVertical: 'top'}]} placeholder="Ceritakan..." multiline value={notes} onChangeText={setNotes} />
            </View>

            <TouchableOpacity style={[styles.submitButton, loading && styles.disabledButton]} onPress={handleSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Kirim Laporan</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: PRIMARY_COLOR, marginLeft: 15 },
  formContainer: { padding: 24 },
  subTitle: { fontSize: 16, color: PRIMARY_COLOR, marginBottom: 20, fontWeight: "bold" },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: "gray", marginBottom: 8 },
  input: { backgroundColor: INPUT_BG, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, padding: 15, fontSize: 16, color: "#111827" },
  feelingContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  feelBtn: { width: '30%', alignItems: 'center', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#eee', backgroundColor: INPUT_BG },
  feelBtnActive: { backgroundColor: PRIMARY_COLOR, borderColor: PRIMARY_COLOR },
  feelText: { marginTop: 5, fontWeight: 'bold', color: 'gray' },
  submitButton: { backgroundColor: BUTTON_COLOR, paddingVertical: 16, borderRadius: 12, alignItems: "center", marginTop: 20, elevation: 5 },
  disabledButton: { opacity: 0.7 },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "bold" }
});