import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PRIMARY_COLOR = "#1C315E";
const INACTIVE_COLOR = "#8e8e93";

type NavItemProps = {
  iconLibrary?: any;
  iconName: string;
  active: boolean;
  size?: number;
  onPress: () => void;
} & TouchableOpacityProps;

const NavItem: React.FC<NavItemProps> = ({
  iconLibrary,
  iconName,
  active,
  size = 26,
  onPress,
  ...rest
}) => {
  const Icon = iconLibrary || Ionicons;
  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      activeOpacity={0.7}
      {...rest}
    >
      <Icon
        name={iconName}
        size={size}
        color={active ? PRIMARY_COLOR : INACTIVE_COLOR}
      />
    </TouchableOpacity>
  );
};

const BottomNavbar: React.FC = () => {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.navbarContainer,
        {
          paddingBottom: insets.bottom > 0 ? insets.bottom - 5 : 10,
        },
      ]}
    >
      <NavItem
        iconName="home"
        active={pathname === "/" || pathname === "/Home"}
        onPress={() => router.push("/Home")}
      />
      <NavItem
        iconName="calendar-outline"
        active={pathname === "/Calendar"}
        onPress={() => router.push("/Calendar")}
      />
      <NavItem
        iconLibrary={MaterialCommunityIcons}
        iconName={
          pathname === "/CreateClub" ? "account-group" : "account-group-outline"
        }
        active={pathname === "/CreateClub"}
        onPress={() => router.push("/CreateClub")}
      />
      <NavItem
        iconName="person-outline"
        active={pathname === "/Profile"}
        onPress={() => router.push("/Profile")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  navbarContainer: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,

    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",

    backgroundColor: "rgba(255, 255, 255, 0.9)", // semi transparan
    borderRadius: 200,
    height: 75,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8, // Android shadow

    zIndex: 100,
  },

  navItem: {
    flex: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default BottomNavbar;
