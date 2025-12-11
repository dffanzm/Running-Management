import React, { useState, useCallback } from "react";
import { 
  Text, 
  View, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator,
  ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from "expo-router";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { supabase } from "../Database/supabaseClient";

// --- Warna Utama ---
const PRIMARY_COLOR = "#1C315E";
const INACTIVE_COLOR = "gray";
const BUTTON_COLOR = "#112952";
const AVATAR_BG_COLOR = "#E6EBF5"; 

export default function ProfileScreen() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State Tambahan untuk Data Unik
  const [athleteStats, setAthleteStats] = useState({ totalDist: 0, totalSessions: 0 });
  const [clubName, setClubName] = useState("-");

  useFocusEffect(
    useCallback(() => {
      fetchProfileData();
    }, [])
  );

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      // 1. Ambil User Session
      const jsonValue = await AsyncStorage.getItem('userSession');
      if (!jsonValue) {
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(jsonValue);
      setUserData(user);

      // 2. Ambil Data Tambahan Berdasarkan Role
      if (user.role === 'Athlete') {
        // A. Hitung Statistik Lari
        const { data: logs } = await supabase
          .from("training_logs")
          .select("actual_distance")
          .eq("athlete_id", user.id);
        
        let dist = 0;
        logs?.forEach(log => dist += (log.actual_distance || 0));
        
        setAthleteStats({
          totalDist: parseFloat(dist.toFixed(1)),
          totalSessions: logs?.length || 0
        });

        // B. Cek Nama Klub (FIX ERROR ARRAY DISINI)
        const { data: member } = await supabase
          .from("club_members")
          .select("clubs(club_name)")
          .eq("athlete_id", user.id)
          .maybeSingle();
        
        // Deteksi apakah data clubs berupa Array atau Object
        const clubData: any = member?.clubs;
        let finalClubName = "Belum Join Klub";

        if (Array.isArray(clubData) && clubData.length > 0) {
            finalClubName = clubData[0].club_name;
        } else if (clubData?.club_name) {
            finalClubName = clubData.club_name;
        }
        
        setClubName(finalClubName);

      } else if (user.role === 'Coach') {
        // Ambil Nama Klub yang dimiliki Coach
        const { data: club } = await supabase
          .from("clubs")
          .select("club_name")
          .eq("user_id", user.id)
          .maybeSingle();
        
        setClubName(club?.club_name || "Belum Membuat Klub");
      }

    } catch (e) {
      console.error("Gagal load data", e);
    } finally {
      setLoading(false);
    }
  };

  const performLogout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      router.replace("/Login");
    } catch (e) {
      console.error("Gagal logout:", e);
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Apakah Anda yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      { text: "Ya, Keluar", onPress: performLogout },
    ]);
  };

  const getInitial = (name: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{paddingBottom: 40}}>
        
        {/* Header Back Button */}
        <View style={styles.header}>
           <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.contentContainer}>
          
          {/* --- Avatar & Basic Info --- */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitial(userData?.username)}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.editIconBtn}
              onPress={() => router.push("/EditProfile")}
            >
               <Ionicons name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>

          <Text style={styles.username}>{userData?.username}</Text>
          <Text style={styles.email}>{userData?.email}</Text>
          
          <View style={[styles.roleBadge, {backgroundColor: userData?.role === 'Coach' ? '#E0E7FF' : '#DCFCE7'}]}>
             <Text style={[styles.roleText, {color: userData?.role === 'Coach' ? PRIMARY_COLOR : '#166534'}]}>
                {userData?.role}
             </Text>
          </View>

          {/* --- SECTION KHUSUS: Pembeda Coach vs Athlete --- */}
          
          {userData?.role === 'Athlete' ? (
            // TAMPILAN ATHLETE (Statistik)
            <View style={styles.statsCard}>
               <Text style={styles.sectionTitle}>Career Stats</Text>
               <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                     <FontAwesome5 name="route" size={20} color={PRIMARY_COLOR} />
                     <Text style={styles.statValue}>{athleteStats.totalDist} km</Text>
                     <Text style={styles.statLabel}>Total Jarak</Text>
                  </View>
                  <View style={styles.verticalLine} />
                  <View style={styles.statItem}>
                     <FontAwesome5 name="running" size={20} color={PRIMARY_COLOR} />
                     <Text style={styles.statValue}>{athleteStats.totalSessions}</Text>
                     <Text style={styles.statLabel}>Sesi Latihan</Text>
                  </View>
               </View>
               <View style={styles.clubInfoRow}>
                  <Text style={styles.clubLabel}>Klub Saat Ini:</Text>
                  <Text style={styles.clubValue}>{clubName}</Text>
               </View>
            </View>
          ) : (
            // TAMPILAN COACH (Info Klub)
            <View style={styles.statsCard}>
               <Text style={styles.sectionTitle}>Club Owner</Text>
               <View style={styles.coachClubRow}>
                  <FontAwesome5 name="medal" size={30} color="#e67e22" />
                  <View>
                    <Text style={styles.clubValue}>{clubName}</Text>
                    <Text style={styles.statLabel}>Head Coach</Text>
                  </View>
               </View>
            </View>
          )}

          {/* --- Menu --- */}
          <View style={styles.menuContainer}>
            
            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => router.push("/EditProfile")}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.iconBox}><Ionicons name="settings-outline" size={20} color={PRIMARY_COLOR} /></View>
                <Text style={styles.menuText}>Edit Profil</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuButton} 
              onPress={() => Alert.alert("Info", "Versi Aplikasi: 1.0.0 (Beta)")}
            >
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.iconBox}><Ionicons name="information-circle-outline" size={20} color={PRIMARY_COLOR} /></View>
                <Text style={styles.menuText}>Tentang Aplikasi</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="gray" />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuButton, {marginTop: 20}]} onPress={handleLogout}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={[styles.iconBox, {backgroundColor: '#FEF2F2'}]}><Ionicons name="log-out-outline" size={20} color="#EF4444" /></View>
                <Text style={[styles.menuText, {color: '#EF4444'}]}>Log Out</Text>
              </View>
            </TouchableOpacity>

          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { justifyContent: "center", alignItems: "center" },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderColor: '#f3f4f6' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: PRIMARY_COLOR },
  
  contentContainer: { alignItems: "center", paddingHorizontal: 20, paddingTop: 30 },
  
  avatarContainer: { marginBottom: 15, position: 'relative' },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: AVATAR_BG_COLOR, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: PRIMARY_COLOR },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: PRIMARY_COLOR },
  editIconBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: PRIMARY_COLOR, padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white' },
  
  username: { fontSize: 24, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 2, textAlign: "center", textTransform: "capitalize" },
  email: { fontSize: 14, color: INACTIVE_COLOR, marginBottom: 10 },
  roleBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginBottom: 25 },
  roleText: { fontWeight: "bold", fontSize: 12, textTransform: "uppercase" },

  // Stats Card (Athlete/Coach)
  statsCard: { width: '100%', backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 25, borderWidth: 1, borderColor: '#eee', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: 'gray', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: PRIMARY_COLOR, marginTop: 5 },
  statLabel: { fontSize: 12, color: 'gray' },
  verticalLine: { width: 1, height: 40, backgroundColor: '#eee' },
  clubInfoRow: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', justifyContent: 'space-between' },
  clubLabel: { color: 'gray', fontSize: 14 },
  clubValue: { fontWeight: 'bold', color: PRIMARY_COLOR, fontSize: 14 },
  
  coachClubRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },

  // Menu List
  menuContainer: { width: "100%", gap: 15 },
  menuButton: { flexDirection: 'row', alignItems: "center", justifyContent: 'space-between', paddingVertical: 5 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuText: { fontSize: 16, fontWeight: "500", color: "#333" },
});