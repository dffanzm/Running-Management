import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../Database/supabaseClient";
import { router, useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const PRIMARY_COLOR = "#1C315E";
const ACCENT_COLOR = "#3498db";
const BUTTON_COLOR = "#112952";

export default function CalendarScreen() {
  const [user, setUser] = useState<any>(null);
  const [plans, setPlans] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);

  // Gunakan useFocusEffect agar data di-refresh saat tab dibuka
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const jsonValue = await AsyncStorage.getItem("userSession");
      if (jsonValue) {
        const userData = JSON.parse(jsonValue);
        setUser(userData);
        
        // LOGIKA BARU: Asalkan bukan Coach, kita anggap Athlete dan ambil datanya
        if (userData.role !== "Coach") {
          await fetchMyPlans(userData.id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPlans = async (athleteId: number) => {
    const { data } = await supabase
      .from("training_plans")
      .select("*")
      .eq("athlete_id", athleteId);

    const marked: any = {};
    data?.forEach((plan) => {
        let color = 'orange'; // Scheduled
        if(plan.status === 'completed') color = '#22c55e'; // Green
        if(plan.status === 'missed') color = '#ef4444'; // Red

        marked[plan.date] = { 
          marked: true, 
          dotColor: color, 
          data: plan 
        };
    });
    setPlans(marked);
  };

  // --- KOMPONEN KARTU DETAIL ---
  const renderDetail = () => {
    if (!selectedDate) {
      return (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="calendar-alt" size={40} color="#ddd" />
          <Text style={styles.hintText}>Pilih tanggal di kalender untuk melihat detail latihan.</Text>
        </View>
      );
    }

    const item = plans[selectedDate];
    
    if (!item) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.hintText}>Tidak ada jadwal latihan pada {selectedDate}.</Text>
          <Text style={{fontSize:12, color:'gray'}}>Istirahat atau latihan mandiri! 💪</Text>
        </View>
      );
    }

    const isCompleted = item.data.status === 'completed';
    const statusColor = isCompleted ? '#22c55e' : '#e67e22'; 

    return (
      <View style={styles.planCard}>
        {/* Header Kartu */}
        <View style={styles.cardHeader}>
          <Text style={styles.planTitle}>{item.data.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{item.data.status.toUpperCase()}</Text>
          </View>
        </View>
        
        {/* Deskripsi */}
        <Text style={styles.planDesc}>{item.data.description || "Tidak ada instruksi khusus."}</Text>
        
        {/* Metrics (Jarak) */}
        <View style={styles.planMetrics}>
           <View style={styles.metricItem}>
              <Ionicons name="speedometer-outline" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.metricText}>{item.data.target_distance} KM</Text>
           </View>
           <View style={styles.metricItem}>
              <Ionicons name="time-outline" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.metricText}>Target Waktu: Bebas</Text>
           </View>
        </View>

        {/* Tombol Input (Jika Belum Selesai) */}
        {!isCompleted && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push({
               pathname: "/InputLog", 
               params: { planId: item.data.id, planTitle: item.data.title }
            })}
          >
            <Text style={styles.actionButtonText}>Input Hasil Latihan</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) return <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{marginTop:50}} />;

  // --- LOGIKA TAMPILAN UTAMA (FIXED) ---
  // Jika User ADALAH Coach -> Tampilkan Pesan Coach
  if (user?.role === "Coach") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Jadwal Latihan</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.infoText}>Halo Coach!</Text>
          <Text style={styles.subInfo}>
            Untuk melihat dan mengatur jadwal, silakan buka menu "Daftar Athlete" di Home.
          </Text>
          <TouchableOpacity style={styles.btn} onPress={() => router.push("/Home")}>
             <Text style={{color:'white', fontWeight:'bold'}}>Ke Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Jika BUKAN Coach (Berarti Athlete), Tampilkan Kalender
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Kalender Latihan</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
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
            dotColor: ACCENT_COLOR,
            todayDotColor: ACCENT_COLOR,
          }}
        />
        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Detail Program</Text>
          {renderDetail()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 20, backgroundColor: PRIMARY_COLOR, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  
  detailSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 15 },

  planCard: { backgroundColor: "white", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#E0E7FF", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  planTitle: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR, flex: 1 },
  
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: "white", fontSize: 10, fontWeight: "bold" },
  
  planDesc: { color: "gray", marginBottom: 20, lineHeight: 20 },
  
  planMetrics: { flexDirection: "row", gap: 20, marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metricText: { fontWeight: "bold", color: PRIMARY_COLOR },
  
  actionButton: { backgroundColor: BUTTON_COLOR, padding: 15, borderRadius: 12, alignItems: "center" },
  actionButtonText: { color: "white", fontWeight: "bold" },

  emptyContainer: { alignItems: 'center', marginTop: 20, padding: 20, backgroundColor: '#F9FAFB', borderRadius: 12 },
  hintText: { textAlign: "center", color: "gray", marginTop: 10, fontSize: 14 },

  centerContent: { flex: 1, justifyContent: "center", alignItems: "center", padding: 30 },
  infoText: { fontSize: 22, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 10 },
  subInfo: { textAlign: "center", color: "gray", marginBottom: 20 },
  btn: { backgroundColor: PRIMARY_COLOR, padding: 15, borderRadius: 10 }
});