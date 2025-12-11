import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

const PRIMARY_COLOR = "#1C315E";
const CARD_BG = "#F9FAFB";
const { width } = Dimensions.get("window");

export default function StatisticsScreen() {
  const params = useLocalSearchParams();
  // Jika ada targetId (dari Coach), pakai itu. Jika tidak, pakai ID sendiri (Athlete).
  const { targetId, name } = params; 

  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    totalSessions: 0,
    avgPace: "-",
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      let athleteId = targetId;

      // Jika tidak ada targetId, berarti Athlete melihat statistik sendiri
      if (!athleteId) {
        const jsonValue = await AsyncStorage.getItem("userSession");
        const userData = JSON.parse(jsonValue || "{}");
        athleteId = userData.id;
      }

      // Ambil SEMUA log latihan athlete ini
      const { data, error } = await supabase
        .from("training_logs")
        .select("*")
        .eq("athlete_id", athleteId)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data);
        calculateStats(data);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    let dist = 0;
    let dur = 0;
    
    data.forEach(log => {
      dist += (log.actual_distance || 0);
      dur += (log.actual_duration || 0);
    });

    setStats({
      totalDistance: parseFloat(dist.toFixed(2)),
      totalDuration: dur,
      totalSessions: data.length,
      avgPace: "Soon", // Nanti bisa dibikin rumus hitung rata-rata pace
    });
  };

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}j ${m}m`;
    return `${m} m`;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Statistik {name ? name : "Saya"}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Ringkasan Utama */}
        <Text style={styles.sectionTitle}>Ringkasan Total</Text>
        <View style={styles.summaryContainer}>
          {/* Card Jarak */}
          <View style={[styles.card, { backgroundColor: PRIMARY_COLOR }]}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="route" size={20} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.cardValueWhite}>{stats.totalDistance} km</Text>
            <Text style={styles.cardLabelWhite}>Total Jarak</Text>
          </View>

          {/* Card Waktu */}
          <View style={[styles.card, { backgroundColor: "white", borderColor: "#eee", borderWidth: 1 }]}>
            <View style={[styles.iconCircle, { backgroundColor: "#F3F4F6" }]}>
              <FontAwesome5 name="stopwatch" size={20} color="gray" />
            </View>
            <Text style={styles.cardValue}>{formatDuration(stats.totalDuration)}</Text>
            <Text style={styles.cardLabel}>Total Waktu</Text>
          </View>
        </View>

        <View style={styles.rowStats}>
           <View style={styles.smallCard}>
              <Text style={styles.smallValue}>{stats.totalSessions}</Text>
              <Text style={styles.smallLabel}>Sesi Latihan</Text>
           </View>
           <View style={styles.smallCard}>
              <Text style={styles.smallValue}>🔥</Text>
              <Text style={styles.smallLabel}>Konsistensi</Text>
           </View>
        </View>

        {/* Riwayat Latihan (List) */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Riwayat Latihan</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        ) : logs.length === 0 ? (
          <Text style={styles.emptyText}>Belum ada data latihan.</Text>
        ) : (
          logs.map((log, index) => (
            <View key={index} style={styles.logItem}>
              <View style={styles.logLeft}>
                <Text style={styles.logDate}>
                  {new Date(log.submitted_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </Text>
                <Text style={styles.logFeeling}>{log.feeling}</Text>
              </View>
              <View style={styles.logCenter}>
                <Text style={styles.logDist}>{log.actual_distance} km</Text>
                <Text style={styles.logDur}>{log.actual_duration} menit</Text>
              </View>
              {log.coach_feedback ? (
                 <FontAwesome5 name="check-circle" size={18} color="#22c55e" />
              ) : (
                 <FontAwesome5 name="clock" size={18} color="orange" />
              )}
            </View>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#F3F4F6" },
  headerTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 15, color: PRIMARY_COLOR },
  
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 15 },
  
  summaryContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  card: { width: "48%", padding: 20, borderRadius: 20, elevation: 3, shadowColor: "#000", shadowOpacity: 0.1 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  
  cardValueWhite: { fontSize: 24, fontWeight: "bold", color: "white" },
  cardLabelWhite: { fontSize: 12, color: "#E0E7FF", marginTop: 5 },
  
  cardValue: { fontSize: 24, fontWeight: "bold", color: PRIMARY_COLOR },
  cardLabel: { fontSize: 12, color: "gray", marginTop: 5 },

  rowStats: { flexDirection: 'row', justifyContent: 'space-between' },
  smallCard: { width: '48%', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 15, alignItems: 'center' },
  smallValue: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR },
  smallLabel: { fontSize: 12, color: 'gray' },

  logItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  logLeft: { width: 60 },
  logDate: { fontWeight: 'bold', color: '#333' },
  logFeeling: { fontSize: 10, color: 'gray' },
  logCenter: { flex: 1 },
  logDist: { fontSize: 16, fontWeight: 'bold', color: PRIMARY_COLOR },
  logDur: { fontSize: 12, color: 'gray' },
  emptyText: { textAlign: 'center', color: 'gray', marginTop: 20, fontStyle: 'italic' }
});