import { Ionicons } from "@expo/vector-icons";
import React from "react";
// Impor properti yang dibutuhkan untuk typing
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

// Warna primer (biru tua) yang Anda gunakan di aplikasi Anda
const PRIMARY_COLOR = "#1C315E";
const INACTIVE_COLOR = "#888";
const HOVER_COLOR = "#f0f0f0"; // Warna background saat hover (abu-abu sangat terang)

// --- FIX TYPESCRIPT: Definisi Tipe Hover Khusus Web ---
// Kita tambahkan properti 'hoverStyle' di sini
interface WebHoverProps {
  onMouseEnter?: (event: any) => void;
  onMouseLeave?: (event: any) => void;
  hoverStyle?: any; // Tambahkan hoverStyle untuk Web
}

// Gabungkan props NavItem dengan props Hover khusus Web
type NavItemProps = {
  iconName: string;
  active: boolean;
  size: number;
  onPress: () => void;
} & TouchableOpacityProps &
  WebHoverProps;
// ----------------------------------------------------

// Komponen NavItem yang menangani status hover dan TypeScript
const NavItem: React.FC<NavItemProps> = ({
  iconName,
  active,
  size,
  onPress,
  ...rest
}) => {
  // Gunakan rest untuk menangkap props tambahan

  // State untuk melacak status hover tidak lagi diperlukan, karena kita menggunakan hoverStyle
  // const [isHovered, setIsHovered] = useState(false); // Dihapus

  // Tentukan warna ikon
  const isStar = iconName === "star";
  const color = active || isStar ? PRIMARY_COLOR : INACTIVE_COLOR;
  const iconSize = isStar ? 32 : size;

  // Tentukan gaya item utama
  const itemStyle = [
    styles.navItem,
    // Pisahkan item terakhir dari border kanan
    iconName !== "person-outline" && styles.separator,
  ];

  return (
    <TouchableOpacity
      style={itemStyle}
      onPress={onPress}
      // --- IMPLEMENTASI HOVER YANG STABIL DI WEB ---
      // Gunakan hoverStyle (hanya berfungsi di Web, diabaikan di Native)
      hoverStyle={
        {
          // Transisi harus didefinisikan di sini untuk properti hover
          transitionDuration: "200ms",
          opacity: 0.8,
          backgroundColor: HOVER_COLOR,
        } as any
      }
      // Hilangkan onMouseEnter/onMouseLeave, karena hoverStyle mengurus semuanya
      {...rest}
    >
      <Ionicons name={iconName as any} size={iconSize} color={color} />
    </TouchableOpacity>
  );
};

const BottomNavbar: React.FC = () => {
  return (
    <View style={styles.navbarContainer}>
                  {/* 1. Home Button */}           {" "}
      <NavItem
        iconName="home"
        active={true} // Home aktif saat ini
        size={26}
        onPress={() => console.log("Home")}
      />
                  {/* 2. Calendar Button */}           {" "}
      <NavItem
        iconName="calendar-outline"
        active={false}
        size={26}
        onPress={() => console.log("Calendar")}
      />
                  {/* 3. Club Button (Star) - Ditegaskan */}           {" "}
      <NavItem
        iconName="star" // ikon solid untuk penegasan
        active={false} // Ukuran dan warna diatur di dalam NavItem
        size={26}
        onPress={() => console.log("Club")}
      />
                  {/* 4. Profile Button */}           {" "}
      <NavItem
        iconName="person-outline"
        active={false}
        size={26}
        onPress={() => console.log("Profile")}
      />
               {" "}
    </View>
  );
};

const styles = StyleSheet.create({
  // --- Style Navbar Container ---
  navbarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",

    // Garis di sekeliling navbar (kotak)
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10, // opsional: biar sudutnya melengkung

    height: 70,
    paddingBottom: 5,
    paddingHorizontal: 0,

    // Tambahan opsional agar efek "box" makin jelas
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, // efek bayangan di Android
  },

  // --- Style Item Navigasi ---
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 5,
  },

  // --- Style Pemisah Vertikal ---
  separator: {
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
});

export default BottomNavbar;
