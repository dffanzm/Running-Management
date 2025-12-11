import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../Database/supabaseClient";
import { router, useFocusEffect } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";

const PRIMARY_COLOR = "#1C315E";
const DANGER_COLOR = "#EF4444";

export default function ClubScreen() {
  const [user, setUser] = useState<any>(null);
  const [clubData, setClubData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Gunakan useFocusEffect agar data ter-refresh saat kembali dari halaman Edit
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem("userSession");
      if (jsonValue) {
        const userData = JSON.parse(jsonValue);
        setUser(userData);

        if (userData.role === "Coach") {
          // Jika Coach, ambil klub yang dia miliki
          const { data } = await supabase.from("clubs").select("*").eq("user_id", userData.id).maybeSingle();
          setClubData(data);
        } else {
          // Jika Athlete, ambil klub tempat dia bergabung
          const { data } = await supabase.from("club_members").select("*, clubs(*)").eq("athlete_id", userData.id).maybeSingle();
          setClubData(data ? data.clubs : null);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI KELUAR KLUB (KHUSUS ATHLETE) ---
  const handleLeaveClub = () => {
    Alert.alert(
      "Keluar dari Klub",
      "Apakah Anda yakin ingin keluar? Statistik latihan Anda TIDAK akan terhapus, namun Anda tidak akan menerima program latihan lagi dari klub ini.",
      [
        { text: "Batal", style: "cancel" },
        { 
          text: "Ya, Keluar", 
          style: "destructive", 
          onPress: performLeave 
        }
      ]
    );
  };

  const performLeave = async () => {
    setLoading(true);
    try {
      // Hapus data di tabel club_members berdasarkan ID Athlete
      const { error } = await supabase
        .from("club_members")
        .delete()
        .eq("athlete_id", user.id);

      if (error) throw error;

      Alert.alert("Berhasil", "Anda telah keluar dari klub.", [
        { text: "OK", onPress: () => {
            setClubData(null); // Hapus data klub dari tampilan
        }}
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat memproses permintaan.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{marginTop:50}} />;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Informasi Klub</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {clubData ? (
          // --- TAMPILAN JIKA SUDAH PUNYA KLUB ---
          <View style={styles.clubCard}>
            <View style={styles.iconBox}>
               <FontAwesome5 name="medal" size={40} color="white" />
            </View>
            <Text style={styles.clubName}>{clubData.club_name}</Text>
            <Text style={styles.clubLoc}>📍 {clubData.domicile}</Text>
            <Text style={styles.coachName}>Coach: {clubData.coach_name}</Text>
            
            <View style={styles.divider} />
            
            <Text style={styles.roleInfo}>
              {user.role === 'Coach' ? "Anda adalah pemilik klub ini." : "Anda adalah anggota klub ini."}
            </Text>

            {/* --- TOMBOL EDIT (HANYA MUNCUL JIKA COACH) --- */}
            {user?.role === 'Coach' && (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => router.push("/EditClub")}
              >
                <Ionicons name="pencil" size={18} color={PRIMARY_COLOR} style={{marginRight: 8}} />
                <Text style={styles.editText}>Edit Nama Klub</Text>
              </TouchableOpacity>
            )}

            {/* --- TOMBOL KELUAR KLUB (Hanya muncul jika user adalah Athlete) --- */}
            {user?.role === 'Athlete' && (
              <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveClub}>
                <Ionicons name="log-out-outline" size={20} color={DANGER_COLOR} style={{marginRight: 8}} />
                <Text style={styles.leaveText}>Keluar dari Klub</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          // --- TAMPILAN JIKA BELUM ADA KLUB (ATAU SUDAH KELUAR) ---
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
               <FontAwesome5 name="users-slash" size={50} color="#ccc" />
            </View>
            <Text style={styles.emptyTitle}>Belum Bergabung</Text>
            
            {user?.role === "Coach" ? (
              // HANYA COACH YANG BOLEH BIKIN KLUB
              <View style={{width: '100%', alignItems: 'center'}}>
                <Text style={styles.emptyDesc}>Anda belum membuat klub lari.</Text>
                <TouchableOpacity style={styles.btn} onPress={() => router.push("/CreateClub")}>
                  <Text style={styles.btnText}>+ Buat Klub Baru</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // ATHLETE HANYA BOLEH CARI KLUB
              <View style={{width: '100%', alignItems: 'center'}}>
                <Text style={styles.emptyDesc}>
                  Anda saat ini tidak memiliki klub. Bergabunglah dengan klub untuk mendapatkan program latihan.
                </Text>
                <TouchableOpacity style={styles.btn} onPress={() => router.push("/SearchClub")}>
                  <Text style={styles.btnText}>🔍 Cari Klub Baru</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { padding: 20, backgroundColor: PRIMARY_COLOR, alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "white" },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  
  clubCard: { alignItems: 'center', padding: 30, backgroundColor: '#F9FAFB', borderRadius: 20, borderWidth: 1, borderColor: '#eee', elevation: 3, shadowColor: "#000", shadowOpacity: 0.1 },
  iconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: PRIMARY_COLOR, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  clubName: { fontSize: 24, fontWeight: 'bold', color: PRIMARY_COLOR, marginBottom: 5, textAlign: 'center' },
  clubLoc: { fontSize: 16, color: '#555', marginBottom: 5 },
  coachName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  
  divider: { width: '100%', height: 1, backgroundColor: '#ddd', marginVertical: 20 },
  roleInfo: { textAlign: 'center', color: 'gray', marginBottom: 20 },

  // Tombol Edit (Coach)
  editButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 12, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: PRIMARY_COLOR, 
    backgroundColor: 'white', 
    marginBottom: 10 
  },
  editText: { color: PRIMARY_COLOR, fontWeight: 'bold', fontSize: 14 },

  // Tombol Keluar (Athlete)
  leaveButton: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 20, borderRadius: 12, borderWidth: 1, borderColor: '#fee2e2', backgroundColor: '#fef2f2' },
  leaveText: { color: DANGER_COLOR, fontWeight: 'bold' },

  // Empty State
  emptyState: { alignItems: 'center', width: '100%' },
  emptyIcon: { marginBottom: 20 },
  emptyTitle: { fontSize: 22, fontWeight: "bold", color: PRIMARY_COLOR, marginBottom: 10 },
  emptyDesc: { color: 'gray', textAlign: 'center', marginBottom: 30, paddingHorizontal: 20, lineHeight: 20 },
  
  btn: { backgroundColor: PRIMARY_COLOR, paddingVertical: 15, paddingHorizontal: 30, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});