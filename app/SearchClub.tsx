import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
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

export default function SearchClubScreen() {
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    fetchClubs();
  }, []);

  // --- 1. AMBIL SEMUA KLUB ---
  const fetchClubs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "Gagal mengambil data klub.");
    } else {
      setClubs(data || []);
    }
    setLoading(false);
  };

  // --- 2. LOGIKA JOIN KLUB ---
  const handleJoin = async (clubId: string, clubName: string) => {
    try {
      // Ambil ID User yang sedang login
      const jsonValue = await AsyncStorage.getItem("userSession");
      const userData = JSON.parse(jsonValue || "{}");

      // Cek apakah sudah pernah request sebelumnya
      const { data: existing } = await supabase
        .from("club_members")
        .select("*")
        .eq("club_id", clubId)
        .eq("athlete_id", userData.id)
        .maybeSingle();

      if (existing) {
        Alert.alert("Info", "Anda sudah mengajukan permintaan ke klub ini.");
        return;
      }

      // Kirim Request Join
      const { error } = await supabase
        .from("club_members")
        .insert([
          {
            club_id: clubId,
            athlete_id: userData.id,
            status: "pending" // Status awal menunggu ACC
          }
        ]);

      if (error) throw error;

      Alert.alert("Berhasil Request", `Permintaan bergabung ke ${clubName} telah dikirim. Tunggu persetujuan Coach.`, [
        { text: "OK", onPress: () => router.replace("/Home") }
      ]);

    } catch (err) {
      console.error(err);
      Alert.alert("Gagal", "Terjadi kesalahan saat join klub.");
    }
  };

  // Filter pencarian
  const filteredClubs = clubs.filter(c => 
    c.club_name.toLowerCase().includes(searchText.toLowerCase()) || 
    c.domicile.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <FontAwesome5 name="running" size={24} color="white" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.clubName}>{item.club_name}</Text>
        <Text style={styles.coachName}>Coach: {item.coach_name}</Text>
        <Text style={styles.location}>📍 {item.domicile}</Text>
      </View>
      <TouchableOpacity 
        style={styles.joinButton} 
        onPress={() => handleJoin(item.id, item.club_name)}
      >
        <Text style={styles.joinText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
        <Text style={styles.title}>Cari Klub Lari</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="gray" style={{marginRight: 10}} />
        <TextInput 
          placeholder="Cari nama klub atau kota..." 
          style={{flex: 1}}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {/* List Klub */}
      {loading ? (
        <ActivityIndicator size="large" color={PRIMARY_COLOR} style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={filteredClubs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20, color: 'gray'}}>Tidak ada klub ditemukan.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 20, fontWeight: "bold", marginLeft: 15, color: PRIMARY_COLOR },
  searchContainer: { 
    flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", 
    margin: 20, padding: 12, borderRadius: 10 
  },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    padding: 15, borderRadius: 12, marginBottom: 15,
    borderWidth: 1, borderColor: "#eee", elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4
  },
  iconContainer: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: PRIMARY_COLOR,
    justifyContent: "center", alignItems: "center", marginRight: 15
  },
  infoContainer: { flex: 1 },
  clubName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  coachName: { fontSize: 14, color: "gray" },
  location: { fontSize: 12, color: "#3498db", marginTop: 4 },
  joinButton: {
    backgroundColor: BUTTON_COLOR, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20
  },
  joinText: { color: "white", fontWeight: "bold", fontSize: 12 }
});