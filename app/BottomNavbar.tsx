import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

// Warna global
const PRIMARY_COLOR = "#1C315E";
const INACTIVE_COLOR = "#888";
const HOVER_COLOR = "#f0f0f0";

interface WebHoverProps {
  onMouseEnter?: (event: any) => void;
  onMouseLeave?: (event: any) => void;
}

// Gabungkan props NavItem
type NavItemProps = {
  iconLibrary?: any;
  iconName: string;
  active: boolean;
  size: number;
  onPress: () => void;
} & TouchableOpacityProps &
  WebHoverProps;

// ============================================================
// Komponen NavItem
// ============================================================
const NavItem: React.FC<NavItemProps> = ({
  iconLibrary,
  iconName,
  active,
  size,
  onPress,
  ...rest
}) => {
  const IconComponent = iconLibrary || Ionicons;
  const [isHovered, setIsHovered] = React.useState(false);

  const color = active ? PRIMARY_COLOR : INACTIVE_COLOR;

  const itemStyle = [
    styles.navItem,
    iconName !== "person-outline" && styles.separator,
    Platform.OS === "web" && isHovered && { backgroundColor: HOVER_COLOR },
  ];

  return (
    <TouchableOpacity
      style={itemStyle}
      onPress={onPress}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      activeOpacity={0.7}
      {...rest}
    >
      <IconComponent name={iconName} size={size} color={color} />
    </TouchableOpacity>
  );
};

// ============================================================
// Komponen Utama Navbar
// ============================================================
const BottomNavbar: React.FC = () => {
  const pathname = usePathname();

  return (
    <View style={styles.navbarContainer}>
      {/* 1. Home */}
      <NavItem
        iconName="home"
        active={pathname === "/"}
        size={26}
        onPress={() => router.push("./Home")}
      />

      {/* 2. Calendar */}
      <NavItem
        iconName="calendar-outline"
        active={pathname === "/Calendar"}
        size={26}
        onPress={() => router.push("/Calendar")}
      />

      {/* 3. Club */}
      <NavItem
        iconLibrary={MaterialCommunityIcons}
        iconName={
          pathname === "/CreateClub" ? "account-group" : "account-group-outline"
        }
        active={pathname === "/CreateClub"}
        size={26}
        onPress={() => router.push("/CreateClub")}
      />

      {/* 4. Profile */}
      <NavItem
        iconName="person-outline"
        active={pathname === "/Profile"}
        size={26}
        onPress={() => router.push("/Profile")}
      />
    </View>
  );
};

// ============================================================
// STYLE
// ============================================================
const styles = StyleSheet.create({
  navbarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",

    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 10,
    height: 70,
    paddingBottom: 5,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 5,
  },

  separator: {
    borderRightWidth: 1,
    borderRightColor: "#f0f0f0",
  },
});

export default BottomNavbar;
