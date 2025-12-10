import {
  Urbanist_400Regular,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

// --- WARNA TEMA ---
const PRIMARY_COLOR = "#1C315E";
const SECONDARY_COLOR = "#2D4B8E";
const BUTTON_COLOR = "#112952";
const ACCENT_COLOR = "#E6EBF5";

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
  });

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Data Coach
  const [myClub, setMyClub] = useState<any>(null); 
  
  // Data Athlete
  const [myMembership, setMyMembership] = useState<any>(null); 
  const [todayProgram, setTodayProgram] = useState<any>(null); // <--- State Baru: Program Hari Ini

  // --- 1. LOGIKA UTAMA ---
  const fetchData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      if (!jsonValue) {
        router.replace("/Login");
        return;
      }

      const userData = JSON.parse(jsonValue);
      setUser(userData);

      if (userData.role === "Coach") {
        await fetchCoachData(userData.id);
      } else if (userData.role === "Athlete") {
        await fetchAthleteData(userData.id);
      }
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCoachData = async (userId: number) => {
    const { data } = await supabase
      .from("clubs")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    setMyClub(data);
  };

  const fetchAthleteData = async (userId: number) => {
    // 1. Ambil Data Klub
    const { data: memberData } = await supabase
      .from("club_members")
      .select("*, clubs(*)")
      .eq("athlete_id", userId)
      .maybeSingle();
    setMyMembership(memberData);

    // 2. Ambil Program Latihan HARI INI
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    const { data: planData } = await supabase
      .from("training_plans")
      .select("*")
      .eq("athlete_id", userId)
      .eq("date", today) // Cari yang tanggalnya hari ini
      .maybeSingle();
      
    setTodayProgram(planData);
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (!fontsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.appContainer} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <HeaderSection user={user} />

        <View style={styles.contentContainer}>
          {user?.role === "Coach" ? (
            <CoachDashboard club={myClub} />
          ) : (
            // Kirim data program ke tampilan Athlete
            <AthleteDashboard membership={myMembership} todayProgram={todayProgram} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ==========================================================
// KOMPONEN UI
// ==========================================================

const HeaderSection = ({ user }: any) => {
  const { height } = useWindowDimensions();
  const imageSource = require("../assets/HOMECOACH.jpg"); 

  return (
    <View style={[styles.topSectionContainer, { height: height * 0.35 }]}>
      <ImageBackground source={imageSource} style={styles.imageBackground} resizeMode="cover">
        <View style={styles.overlayContainer}>
          <Text style={styles.welcomeSubText}>Welcome Back,</Text>
          <Text style={styles.welcomeText}>{user?.username || "Runner"}!</Text>
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{user?.role}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

// --- DASHBOARD COACH ---
const CoachDashboard = ({ club }: { club: any }) => {
  if (!club) {
    return (
      <View style={styles.middleSection}>
        <Text style={styles.emptyTitle}>Mulai Karir Melatihmu</Text>
        <Text style={styles.emptyDesc}>Anda belum memiliki klub. Buat sekarang untuk merekrut atlet.</Text>
        <TouchableOpacity style={styles.createClubButton} onPress={() => router.push("/CreateClub")}>
          <Text style={styles.createClubText}>CREATE YOUR CLUB</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.dashboardSection}>
       <View style={styles.clubCard}>
          <View>
            <Text style={styles.clubLabel}>Your Club</Text>
            <Text style={styles.clubName}>{club.club_name}</Text>
            <Text style={styles.clubLocation}>📍 {club.domicile}</Text>
          </View>
          <FontAwesome5 name="medal" size={32} color="white" opacity={0.8} />
       </View>

       <Text style={styles.sectionTitle}>Menu Pelatih</Text>
       <View style={styles.menuGrid}>
          <MenuButton 
            title="Daftar Atlet" icon="users" color="#3498db" 
            onPress={() => router.push({ pathname: "/AthleteList", params: { clubId: club.id } })} 
          />
          <MenuButton 
            title="Notifikasi" icon="bell" color="#e67e22" 
            onPress={() => router.push({ pathname: "/AthleteList", params: { clubId: club.id } })} 
          />
          <MenuButton title="Program" icon="calendar-alt" color="#27ae60" onPress={() => Alert.alert("Coming Soon", "Fitur Kalender")} />
          <MenuButton title="Statistik" icon="chart-bar" color="#8e44ad" onPress={() => Alert.alert("Coming Soon", "Fitur Statistik")} />
       </View>
    </View>
  );
};

// --- DASHBOARD ATHLETE (UPDATED) ---
const AthleteDashboard = ({ membership, todayProgram }: { membership: any, todayProgram: any }) => {
  if (!membership) {
    return (
      <View style={styles.middleSection}>
        <Text style={styles.emptyTitle}>Cari Komunitasmu</Text>
        <Text style={styles.emptyDesc}>Bergabunglah dengan klub untuk mendapatkan program latihan terarah.</Text>
        <TouchableOpacity style={styles.createClubButton} onPress={() => router.push("/SearchClub")}>
          <Text style={styles.createClubText}>SEARCH CLUB / COACH</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.dashboardSection}>
       <View style={[styles.clubCard, { backgroundColor: SECONDARY_COLOR }]}>
          <View>
            <Text style={styles.clubLabel}>Member of</Text>
            <Text style={styles.clubName}>{membership.clubs?.club_name}</Text>
            <Text style={styles.clubLocation}>Status: {membership.status}</Text>
          </View>
          <FontAwesome5 name="running" size={32} color="white" opacity={0.8} />
       </View>

       <Text style={styles.sectionTitle}>Program Hari Ini</Text>
       
       {/* LOGIKA TAMPILAN PROGRAM */}
       {todayProgram ? (
         <View style={styles.activePlanCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{todayProgram.title}</Text>
              <View style={[styles.statusBadge, 
                { backgroundColor: todayProgram.status === 'completed' ? '#22c55e' : '#e67e22' }
              ]}>
                <Text style={styles.statusText}>
                  {todayProgram.status === 'completed' ? 'Selesai' : 'Belum Selesai'}
                </Text>
              </View>
            </View>
            
            <Text style={styles.planDesc}>{todayProgram.description || "Tidak ada instruksi khusus."}</Text>
            
            <View style={styles.planMetrics}>
               <View style={styles.metricItem}>
                  <Ionicons name="speedometer-outline" size={18} color={PRIMARY_COLOR} />
                  <Text style={styles.metricText}>{todayProgram.target_distance} KM</Text>
               </View>
               <View style={styles.metricItem}>
                  <Ionicons name="time-outline" size={18} color={PRIMARY_COLOR} />
                  <Text style={styles.metricText}>Target Waktu: Bebas</Text>
               </View>
            </View>

            {/* Tombol Input Hasil (Hanya jika belum selesai) */}
            {todayProgram.status !== 'completed' && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => router.push({
                   pathname: "/InputLog", // <--- Kita akan buat file ini setelah ini
                   params: { planId: todayProgram.id, planTitle: todayProgram.title }
                })}
              >
                <Text style={styles.actionButtonText}>Input Hasil Latihan</Text>
              </TouchableOpacity>
            )}
         </View>
       ) : (
         <View style={styles.programCard}>
            <Text style={styles.emptyDesc}>Tidak ada jadwal latihan hari ini. Istirahatlah!</Text>
         </View>
       )}
    </View>
  );
};

const MenuButton = ({ title, icon, color, onPress }: any) => (
  <TouchableOpacity style={[styles.menuItem, { backgroundColor: color }]} onPress={onPress}>
    <FontAwesome5 name={icon} size={20} color="white" />
    <Text style={styles.menuText}>{title}</Text>
  </TouchableOpacity>
);

// --- STYLE ---
const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: "white" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // Header
  topSectionContainer: { width: "100%", overflow: "hidden", marginBottom: 20 },
  imageBackground: { flex: 1, width: "100%", height: "100%", justifyContent: "flex-end" },
  overlayContainer: { padding: 25, paddingBottom: 40 },
  welcomeSubText: { color: "#ddd", fontSize: 16, fontFamily: "Urbanist-Regular" },
  welcomeText: { color: "white", fontSize: 36, fontFamily: "Urbanist-Bold", textShadowColor: "rgba(0,0,0,0.5)", textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  roleBadge: { backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginTop: 5 },
  roleText: { color: "white", fontFamily: "Urbanist-Bold", fontSize: 12, textTransform: "uppercase" },

  // Content
  contentContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  middleSection: { alignItems: "center", marginTop: 10 },
  emptyTitle: { fontSize: 20, fontFamily: "Urbanist-Bold", color: PRIMARY_COLOR, marginBottom: 10 },
  emptyDesc: { fontSize: 14, fontFamily: "Urbanist-Regular", color: "gray", textAlign: "center", marginBottom: 25 },
  
  createClubButton: { backgroundColor: BUTTON_COLOR, paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  createClubText: { color: "white", fontSize: 16, fontFamily: "Urbanist-Bold", letterSpacing: 1 },

  dashboardSection: { width: "100%" },
  clubCard: { backgroundColor: PRIMARY_COLOR, borderRadius: 16, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, elevation: 4 },
  clubLabel: { color: "#A0AEC0", fontSize: 12, marginBottom: 4 },
  clubName: { color: "white", fontSize: 20, fontFamily: "Urbanist-Bold" },
  clubLocation: { color: "#E2E8F0", fontSize: 12, marginTop: 4 },

  sectionTitle: { fontSize: 18, fontFamily: "Urbanist-Bold", color: PRIMARY_COLOR, marginBottom: 15 },
  
  menuGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  menuItem: { width: "48%", aspectRatio: 1.3, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 15, elevation: 2 },
  menuText: { color: "white", fontSize: 14, fontFamily: "Urbanist-Bold", marginTop: 8 },

  programCard: { backgroundColor: "#F9FAFB", padding: 20, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", alignItems: "center" },

  // Active Plan Card Styles
  activePlanCard: { backgroundColor: "white", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#E0E7FF", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1 },
  planHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  planTitle: { fontSize: 18, fontWeight: "bold", color: PRIMARY_COLOR, flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { color: "white", fontSize: 10, fontWeight: "bold" },
  planDesc: { color: "gray", marginBottom: 20, lineHeight: 20 },
  planMetrics: { flexDirection: "row", gap: 20, marginBottom: 20 },
  metricItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  metricText: { fontWeight: "bold", color: PRIMARY_COLOR },
  actionButton: { backgroundColor: BUTTON_COLOR, padding: 15, borderRadius: 12, alignItems: "center" },
  actionButtonText: { color: "white", fontWeight: "bold" }
});