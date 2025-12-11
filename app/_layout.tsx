import { Tabs } from "expo-router";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, 
        tabBarActiveTintColor: "#1C315E",
        tabBarInactiveTintColor: "gray",
        // --- PERBAIKAN NAVBAR KETUTUPAN ---
        tabBarStyle: { 
          height: Platform.OS === 'android' ? 120 : 90, // Naikkan tinggi navbar (terutama Android)
          paddingBottom: Platform.OS === 'android' ? 12 : 30, // Tambah jarak bawah
          paddingTop: 12,
        },
        tabBarLabelStyle: { 
          fontSize: 12, 
          fontWeight: "bold",
          marginBottom: Platform.OS === 'android' ? 5 : 0 
        },
      }}
    >
      {/* 1. HOME */}
      <Tabs.Screen
        name="Home"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />

      {/* 2. CALENDAR (JADWAL) */}
      <Tabs.Screen
        name="Calendar"
        options={{
          tabBarLabel: "Jadwal",
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />

      {/* 3. CLUB (GRUP) */}
      <Tabs.Screen
        name="Club"
        options={{
          tabBarLabel: "Club",
          tabBarIcon: ({ color }) => <FontAwesome5 name="users" size={20} color={color} />,
        }}
      />

      {/* 4. PROFILE */}
      <Tabs.Screen
        name="Profile"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />

      {/* --- SEMBUNYIKAN FILE LAIN DARI NAVBAR --- */}
      {/* Tambahkan href: null agar tidak muncul jadi tombol */}
      
      <Tabs.Screen name="Training" options={{ href: null }} />  {/* <-- INI YANG BIKIN MUNCUL TADI */}
      
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="Login" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="Register" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="CreateClub" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="SearchClub" options={{ href: null }} />
      <Tabs.Screen name="AthleteList" options={{ href: null }} />
      <Tabs.Screen name="AthleteDetail" options={{ href: null }} />
      <Tabs.Screen name="InputLog" options={{ href: null }} />
      <Tabs.Screen name="AddTarget" options={{ href: null }} />
      <Tabs.Screen name="Statistics" options={{ href: null }} />
      <Tabs.Screen name="EditProfile" options={{ href: null }} />
      <Tabs.Screen name="ForgotPassword" options={{ href: null }} />
      <Tabs.Screen name="Welcome" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="CekEmail" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="Achievements" options={{ href: null }} />
      <Tabs.Screen name="BottomNavbar" options={{ href: null }} />
      <Tabs.Screen name="HomeAthlete" options={{ href: null }} />
      {/* Tambahkan ini: */}
      <Tabs.Screen 
        name="EditClub" 
        options={{ 
          href: null, // Artinya: Jangan tampilkan di menu bawah
          tabBarStyle: { display: "none" } // Sembunyikan navbar saat di halaman ini
        }} 
      />
    </Tabs>
  );
}