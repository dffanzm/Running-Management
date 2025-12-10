import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

const PRIMARY_COLOR = "#1C315E";
const ACCENT_COLOR = "#3498db";
const SUCCESS_COLOR = "#22c55e";
const WARNING_COLOR = "#e67e22";

export default function AthleteDetailScreen() {
  const params = useLocalSearchParams();
  const { athleteId, athleteName } = params;

  const [selectedDate, setSelectedDate] = useState("");
  const [plans, setPlans] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // State Modal Tambah Program
  const [modalVisible, setModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [targetDist, setTargetDist] = useState("");

  useEffect(() => {
    fetchTrainingPlans();
  }, [athleteId]);

  // --- 1. AMBIL DATA PROGRAM & LOG SEKALIGUS ---
  const fetchTrainingPlans = async () => {
    try {
      // Kita Join tabel training_plans dengan training_logs
      const { data, error } = await supabase
        .from("training_plans")
        .select(`
          *,
          training_logs (*) 
        `)
        .eq("athlete_id", athleteId);

      if (error) throw error;

      const markedDates: any = {};
      data?.forEach((plan) => {
        let dotColor = 'orange'; // Default: Scheduled
        if (plan.status === 'completed') dotColor = 'green';
        if (plan.status === 'missed') dotColor = 'red';

        markedDates[plan.date] = { 
          marked: true, 
          dotColor: dotColor,
          data: plan,
          log: plan.training_logs?.[0] // Ambil data log jika ada
        };
      });

      setPlans(markedDates);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 2. TAMBAH PROGRAM BARU ---
  const handleAddPlan = async () => {
    if (!newTitle || !targetDist) {
      Alert.alert("Error", "Judul dan Target Jarak wajib diisi!");
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      const coachData = JSON.parse(jsonValue || "{}");

      const { error } = await supabase.from("training_plans").insert([
        {
          coach_id: coachData.id,
          athlete_id: athleteId,
          date: selectedDate,
          title: newTitle,
          description: newDesc,
          target_distance: parseFloat(targetDist),
          status: "scheduled"
        }
      ]);

      if (error) throw error;

      Alert.alert("Sukses", "Program latihan berhasil dibuat!");
      setModalVisible(false);
      setNewTitle(""); setNewDesc(""); setTargetDist("");
      fetchTrainingPlans(); 

    } catch (err) {
      Alert.alert("Gagal", "Terjadi kesalahan saat menyimpan.");
    }
  };

// --- 3. FUNGSI BERI FEEDBACK ---
  const giveFeedback = async (logId: string, feedback: string) => {
    try {
      console.log("Mencoba update log ID:", logId, "dengan feedback:", feedback); // Cek di terminal

      const { error } = await supabase
        .from("training_logs")
        .update({ coach_feedback: feedback }) // Kolom yang diupdate
        .eq("id", logId); // Syarat: ID harus cocok

      if (error) {
        console.error("Supabase Error:", error); // Lihat error detail di terminal
        throw error;
      }

      Alert.alert("Tersimpan", `Feedback "${feedback}" berhasil dikirim.`);
      fetchTrainingPlans(); // Refresh tampilan biar tombolnya berubah jadi teks
    } catch (err) {
      Alert.alert("Error", "Gagal menyimpan feedback. Cek koneksi atau izin RLS.");
    }
  };

  // --- RENDER DETAIL DI BAWAH KALENDER ---
  const renderSelectedDateInfo = () => {
    if (!selectedDate) return <Text style={styles.hintText}>Pilih tanggal untuk melihat detail.</Text>;

    const item = plans[selectedDate]; // Data Plan + Log

    return (
      <View style={styles.detailBox}>
        <Text style={styles.dateTitle}>📅 {selectedDate}</Text>
        
        {item ? (
          <View>
            {/* BAGIAN 1: RENCANA (PLAN) */}
            <View style={styles.planCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardLabel}>PROGRAM</Text>
                <Text style={[styles.statusBadge, {color: item.dotColor}]}>
                  {item.data.status.toUpperCase()}
                </Text>
              </View>
              <Text style={styles.planTitle}>{item.data.title}</Text>
              <Text style={styles.planDesc}>{item.data.description || "-"}</Text>
              <Text style={styles.planTarget}>🎯 Target: {item.data.target_distance} km</Text>
            </View>

            {/* BAGIAN 2: HASIL (LOG) - HANYA JIKA SUDAH DIKERJAKAN */}
            {item.data.status === 'completed' && item.log && (
              <View style={styles.logCard}>
                <Text style={styles.cardLabel}>HASIL LATIHAN (ATHLETE)</Text>
                
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Ionicons name="speedometer" size={18} color={PRIMARY_COLOR} />
                    <Text style={styles.statValue}>{item.log.actual_distance} km</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="timer" size={18} color={PRIMARY_COLOR} />
                    <Text style={styles.statValue}>{item.log.actual_duration} m</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Ionicons name="heart" size={18} color="red" />
                    <Text style={styles.statValue}>{item.log.avg_hr} bpm</Text>
                  </View>
                </View>

                <Text style={styles.noteLabel}>Catatan Athlete:</Text>
                <Text style={styles.noteText}>"{item.log.notes}"</Text>
                <Text style={styles.noteLabel}>Perasaan:</Text>
                <Text style={styles.noteText}>{item.log.feeling}</Text>

                {/* BAGIAN 3: FEEDBACK COACH */}
                <View style={styles.feedbackSection}>
                  <Text style={styles.cardLabel}>FEEDBACK COACH</Text>
                  {item.log.coach_feedback ? (
                    <View style={styles.feedbackGiven}>
                      <FontAwesome5 name="check-circle" size={16} color="white" />
                      <Text style={styles.feedbackText}>{item.log.coach_feedback}</Text>
                    </View>
                  ) : (
                    <View style={styles.feedbackButtons}>
                      <TouchableOpacity 
                        style={[styles.fbBtn, {backgroundColor: '#22c55e'}]}
                        onPress={() => giveFeedback(item.log.id, "Terlaksana Baik")}
                      >
                        <Text style={styles.fbBtnText}>Baik 👍</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.fbBtn, {backgroundColor: '#e67e22'}]}
                        onPress={() => giveFeedback(item.log.id, "Terlaksana Buruk")}
                      >
                        <Text style={styles.fbBtnText}>Buruk 👎</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={[styles.fbBtn, {backgroundColor: '#ef4444'}]}
                        onPress={() => giveFeedback(item.log.id, "Tidak Terlaksana")}
                      >
                        <Text style={styles.fbBtnText}>Gagal ❌</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        ) : (
          <View style={{alignItems: 'center'}}>
            <Text style={styles.noPlanText}>Belum ada program latihan.</Text>
            <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addButtonText}>+ Buat Program</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
           <Text style={styles.headerTitle}>{athleteName}</Text>
           <Text style={styles.headerSubtitle}>Monitoring & Evaluasi</Text>
        </View>
        <View style={{width: 24}} />
      </View>

      <ScrollView>
        <Calendar
          onDayPress={(day: any) => setSelectedDate(day.dateString)}
          markedDates={{
            ...plans,
            [selectedDate]: { selected: true, selectedColor: ACCENT_COLOR, ...plans[selectedDate] }
          }}
          theme={{
            selectedDayBackgroundColor: ACCENT_COLOR,
            todayTextColor: ACCENT_COLOR,
            arrowColor: PRIMARY_COLOR,
          }}
        />
        {renderSelectedDateInfo()}
      </ScrollView>

      {/* Modal Input Program */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Program: {selectedDate}</Text>
            <TextInput style={styles.input} placeholder="Judul Latihan" value={newTitle} onChangeText={setNewTitle} />
            <TextInput style={styles.input} placeholder="Target Jarak (KM)" keyboardType="numeric" value={targetDist} onChangeText={setTargetDist} />
            <TextInput style={[styles.input, {height: 60}]} placeholder="Deskripsi" multiline value={newDesc} onChangeText={setNewDesc} />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.btnCancel} onPress={() => setModalVisible(false)}><Text>Batal</Text></TouchableOpacity>
              <TouchableOpacity style={styles.btnSave} onPress={handleAddPlan}><Text style={{color:'white'}}>Simpan</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: PRIMARY_COLOR },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  headerSubtitle: { fontSize: 12, color: "#cbd5e1" },
  
  detailBox: { padding: 20, paddingBottom: 50 },
  hintText: { textAlign: "center", color: "gray", marginTop: 20 },
  dateTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, color: PRIMARY_COLOR },
  noPlanText: { fontStyle: "italic", color: "gray", marginBottom: 15 },

  // Kartu Rencana
  planCard: { backgroundColor: "white", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginBottom: 15, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  cardLabel: { fontSize: 10, fontWeight: 'bold', color: 'gray', letterSpacing: 1 },
  statusBadge: { fontSize: 10, fontWeight: 'bold' },
  planTitle: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR },
  planDesc: { color: "#555", fontSize: 14, marginVertical: 5 },
  planTarget: { color: ACCENT_COLOR, fontWeight: "bold", marginTop: 5 },

  // Kartu Hasil Log
  logCard: { backgroundColor: "#F0F9FF", padding: 15, borderRadius: 12, borderWidth: 1, borderColor: "#BAE6FD" },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 10, backgroundColor: 'white', padding: 10, borderRadius: 8 },
  statItem: { alignItems: 'center' },
  statValue: { fontWeight: 'bold', marginTop: 3 },
  noteLabel: { fontSize: 12, fontWeight: 'bold', marginTop: 10, color: '#555' },
  noteText: { fontStyle: 'italic', color: '#333' },

  // Feedback Section
  feedbackSection: { marginTop: 15, borderTopWidth: 1, borderTopColor: '#ddd', paddingTop: 10 },
  feedbackButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  fbBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  fbBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  feedbackGiven: { flexDirection: 'row', alignItems: 'center', backgroundColor: PRIMARY_COLOR, padding: 10, borderRadius: 8, marginTop: 5, gap: 8 },
  feedbackText: { color: 'white', fontWeight: 'bold' },

  addButton: { backgroundColor: PRIMARY_COLOR, padding: 15, borderRadius: 10, width: '100%', alignItems: "center" },
  addButtonText: { color: "white", fontWeight: "bold" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "white", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 15 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end", gap: 15 },
  btnCancel: { padding: 10 },
  btnSave: { backgroundColor: PRIMARY_COLOR, padding: 10, borderRadius: 8, paddingHorizontal: 20 }
});