import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

// --- WARNA TEMA ---
const PRIMARY_COLOR = "#1C315E";
const ACCENT_COLOR = "#3498db";
const PENDING_COLOR = "#e67e22";

export default function AthleteListScreen() {
  const params = useLocalSearchParams();
  const clubId = params.clubId; // ID Klub dikirim dari Home

  const [activeTab, setActiveTab] = useState("active"); // 'active' atau 'pending'
  const [members, setMembers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- AMBIL DATA MEMBER ---
  const fetchMembers = async () => {
    if (!clubId) return;
    setLoading(true);

    try {
      // Ambil data dari tabel club_members digabung dengan tabel users (untuk nama)
      const { data, error } = await supabase
        .from("club_members")
        .select(`
          id,
          status,
          users:athlete_id ( id, username, email )
        `)
        .eq("club_id", clubId);

      if (error) throw error;

      // Pisahkan data berdasarkan status
      const active = data.filter((m: any) => m.status === "accepted");
      const pending = data.filter((m: any) => m.status === "pending");

      setMembers(active);
      setRequests(pending);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Gagal mengambil data atlet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [clubId]);

  // --- FUNGSI ACC / TOLAK ---
  const handleApproval = async (memberId: string, isAccepted: boolean) => {
    const newStatus = isAccepted ? "accepted" : "rejected";
    
    // Jika ditolak, kita hapus saja datanya biar bersih (atau bisa set 'rejected')
    if (!isAccepted) {
      const { error } = await supabase.from("club_members").delete().eq("id", memberId);
      if (!error) {
        Alert.alert("Ditolak", "Permintaan bergabung telah dihapus.");
        fetchMembers(); // Refresh
      }
      return;
    }

    // Jika diterima, update status jadi 'accepted'
    const { error } = await supabase
      .from("club_members")
      .update({ status: "accepted" })
      .eq("id", memberId);

    if (error) {
      Alert.alert("Gagal", "Terjadi kesalahan saat memproses data.");
    } else {
      Alert.alert("Sukses", "Atlet berhasil ditambahkan ke klub!");
      fetchMembers(); // Refresh data
    }
  };

// --- RENDER ITEM LIST (UPDATED) ---
  const renderItem = ({ item }: { item: any }) => (
    // Tambahkan TouchableOpacity agar seluruh kartu bisa diklik
    <TouchableOpacity 
      onPress={() => {
        // Hanya pindah halaman jika statusnya ACCEPTED (bukan request)
        if (activeTab === "active") {
          router.push({
            pathname: "/AthleteDetail",
            params: { 
              athleteId: item.users.id, // Kirim ID Anis
              athleteName: item.users.username // Kirim Nama Anis
            }
          });
        }
      }}
      activeOpacity={activeTab === "active" ? 0.7 : 1} // Efek klik hanya untuk member aktif
    >
      <View style={styles.card}>
        <View style={styles.profileContainer}>
          {/* Avatar Inisial */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.users?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.name}>{item.users?.username}</Text>
            <Text style={styles.email}>{item.users?.email}</Text>
          </View>
        </View>

        {/* Tombol Aksi (Khusus Tab Request) */}
        {activeTab === "pending" ? (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.btn, styles.btnReject]} 
              onPress={() => handleApproval(item.id, false)}
            >
              <Ionicons name="close" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.btn, styles.btnAccept]}
              onPress={() => handleApproval(item.id, true)}
            >
              <Ionicons name="checkmark" size={20} color="white" />
            </TouchableOpacity>
          </View>
        ) : (
          // Jika sudah Active, tampilkan panah kanan
          <Ionicons name="chevron-forward" size={20} color="gray" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>Manajemen Atlet</Text>
        <View style={{ width: 24 }} /> 
      </View>

      {/* Tabs (Active vs Pending) */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "active" && styles.activeTab]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>
            Atlet ({members.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.tabText, activeTab === "pending" && styles.activeTabText]}>
              Request ({requests.length})
            </Text>
            {requests.length > 0 && <View style={styles.badge} />}
          </View>
        </TouchableOpacity>
      </View>

      {/* List Content */}
      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={activeTab === "active" ? members : requests}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchMembers} />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <FontAwesome5 name={activeTab === "active" ? "running" : "inbox"} size={50} color="#ccc" />
              <Text style={styles.emptyText}>
                {activeTab === "active" 
                  ? "Belum ada atlet di klub ini." 
                  : "Tidak ada permintaan bergabung baru."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { 
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", 
    padding: 20, borderBottomWidth: 1, borderBottomColor: "#eee" 
  },
  title: { fontSize: 20, fontWeight: "bold", color: PRIMARY_COLOR },
  
  tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#eee" },
  tab: { flex: 1, paddingVertical: 15, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: PRIMARY_COLOR },
  tabText: { fontSize: 16, color: "gray", fontWeight: "bold" },
  activeTabText: { color: PRIMARY_COLOR },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: "red", marginLeft: 5, marginBottom: 5 },

  card: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#F9FAFB", padding: 15, borderRadius: 12, marginBottom: 15,
    borderWidth: 1, borderColor: "#eee"
  },
  profileContainer: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatar: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: "#E0E7FF",
    justifyContent: "center", alignItems: "center", marginRight: 15
  },
  avatarText: { fontSize: 20, fontWeight: "bold", color: PRIMARY_COLOR },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  email: { fontSize: 12, color: "gray" },

  actionButtons: { flexDirection: "row", gap: 10 },
  btn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  btnReject: { backgroundColor: "#ef4444" },
  btnAccept: { backgroundColor: "#22c55e" },

  emptyState: { alignItems: "center", marginTop: 50 },
  emptyText: { color: "gray", marginTop: 10 }
});