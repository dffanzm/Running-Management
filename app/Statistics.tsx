import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

const PRIMARY_COLOR = "#1C315E";

export default function StatisticsScreen() {
  const params = useLocalSearchParams();
  const [userName, setUserName] = useState("User");
  
  // State Statistik
  const [stats, setStats] = useState({ totalDist: 0, totalTime: 0, sessions: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto Refresh saat halaman dibuka
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      let targetId = params.targetId;
      let targetName = params.name;

      if (!targetId) {
        const jsonValue = await AsyncStorage.getItem("userSession");
        if (jsonValue) {
          const user = JSON.parse(jsonValue);
          targetId = user.id;
          targetName = user.username;
        }
      }

      setUserName(targetName as string);

      if (targetId) {
        await fetchStats(targetId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (id: any) => {
    // Ambil data log latihan
    const { data, error } = await supabase
      .from("training_logs")
      .select("*")
      .eq("athlete_id", id)
      // PERBAIKAN DI SINI: Ganti 'created_at' menjadi 'id' agar tidak error
      .order("id", { ascending: false }); 

    if (error) {
      console.error("Gagal ambil statistik:", error.message);
      return;
    }

    if (data) {
      setLogs(data);
      
      let totalDistance = 0;
      let totalDuration = 0;
      
      // LOGIKA HITUNG (Paksa jadi Angka)
      data.forEach(log => {
        const d = parseFloat(log.actual_distance);
        const t = parseFloat(log.actual_duration);

        if (!isNaN(d)) {
          totalDistance += d;
        }
        if (!isNaN(t)) {
          totalDuration += t;
        }
      });
      
      setStats({ 
        totalDist: parseFloat(totalDistance.toFixed(2)), 
        totalTime: totalDuration, 
        sessions: data.length 
      });
    }
  };

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}j ${m}m`;
  };

  if (loading) return <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{marginTop: 50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={{alignItems:'center'}}>
           <Text style={styles.headerTitle}>{userName}</Text>
           <Text style={styles.headerSubtitle}>Statistik Performa</Text>
        </View>
        <FontAwesome5 name="chart-line" size={24} color="white" />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* RINGKASAN TOTAL */}
        <Text style={styles.sectionTitle}>Ringkasan Total</Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.card, styles.cardBlue]}>
            <View style={styles.iconCircle}>
               <FontAwesome5 name="route" size={20} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.cardValue}>{stats.totalDist} km</Text>
            <Text style={styles.cardLabel}>Total Jarak</Text>
          </View>

          <View style={styles.card}>
            <View style={[styles.iconCircle, {backgroundColor: '#f3f4f6'}]}>
               <FontAwesome5 name="stopwatch" size={20} color="gray" />
            </View>
            <Text style={[styles.cardValue, {color: '#333'}]}>{formatTime(stats.totalTime)}</Text>
            <Text style={styles.cardLabel}>Total Waktu</Text>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.card}>
             <Text style={[styles.cardValue, {color: PRIMARY_COLOR}]}>{stats.sessions}</Text>
             <Text style={styles.cardLabel}>Sesi Latihan</Text>
          </View>
          <View style={styles.card}>
             <Text style={[styles.cardValue, {color: '#e67e22'}]}>🔥</Text>
             <Text style={styles.cardLabel}>Konsistensi</Text>
          </View>
        </View>

        {/* RIWAYAT LATIHAN */}
        <Text style={styles.sectionTitle}>Riwayat Latihan</Text>
        {logs.length > 0 ? logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <View>
              {/* Tampilkan Tanggal (Default hari ini jika null) */}
              <Text style={styles.logDate}>
                {log.date ? new Date(log.date).toLocaleDateString() : "Tanggal -"}
              </Text>
              <Text style={styles.logFeeling}>{log.feeling || "Tidak ada catatan"}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.logMainVal}>{log.actual_distance} km</Text>
              <Text style={styles.logSubVal}>{log.actual_duration} menit</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#22c55e" style={{marginLeft: 10}} />
          </View>
        )) : (
          <View style={styles.emptyBox}>
            <Text style={{color:'gray', fontStyle:'italic'}}>Belum ada data latihan.</Text>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 20, backgroundColor: PRIMARY_COLOR },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "white" },
  headerSubtitle: { fontSize: 12, color: "#cbd5e1" },
  
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, marginTop: 10, color: '#333' },
  summaryGrid: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  card: { flex: 1, backgroundColor: 'white', padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#eee', elevation: 2 },
  cardBlue: { backgroundColor: PRIMARY_COLOR },
  cardValue: { fontSize: 22, fontWeight: 'bold', marginTop: 10, marginBottom: 5, color: 'white' },
  cardLabel: { fontSize: 12, color: '#ccc' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' },
  
  logItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  logDate: { fontWeight: 'bold', fontSize: 14, color: '#333' },
  logFeeling: { fontSize: 12, color: 'gray' },
  logMainVal: { fontWeight: 'bold', fontSize: 16, color: PRIMARY_COLOR },
  logSubVal: { fontSize: 12, color: 'gray' },
  
  emptyBox: { alignItems: 'center', padding: 20, marginTop: 10, backgroundColor: '#F9FAFB', borderRadius: 10 }
});