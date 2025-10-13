import {
  Urbanist_400Regular,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { supabase } from "../Database/supabaseClient"; // Import supabase

// Google Icon
const GoogleIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 48 48">
    <Path
      fill="#EA4335"
      d="M24 9.5c3.94 0 7.16 1.62 9.42 3.56l6.92-6.92C36.32 2.42 30.72 0 24 0 14.64 0 6.54 5.64 2.56 13.86l8.5 6.6C12.76 13.08 17.94 9.5 24 9.5z"
    />
    <Path
      fill="#34A853"
      d="M46.1 24.56c0-1.6-.14-3.12-.4-4.56H24v9.12h12.6c-.54 2.76-2.18 5.1-4.64 6.66l7.2 5.6c4.2-3.88 6.94-9.6 6.94-16.82z"
    />
    <Path
      fill="#4A90E2"
      d="M24 48c6.48 0 11.9-2.14 15.86-5.82l-7.2-5.6c-2.02 1.36-4.62 2.16-8.66 2.16-6.06 0-11.24-3.58-13.06-8.56l-8.5 6.6C6.54 42.36 14.64 48 24 48z"
    />
    <Path
      fill="#FBBC05"
      d="M10.94 30.18c-.46-1.36-.72-2.82-.72-4.18s.26-2.82.72-4.18l-8.5-6.6C1.54 17.78 0 20.72 0 24s1.54 6.22 2.44 8.78l8.5-6.6z"
    />
  </Svg>
);

const Register = () => {
  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
    "Urbanist-SemiBold": Urbanist_600SemiBold,
  });

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    role: "",
  });

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    gender: "",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Animasi Gender
  const genderAnim = useRef(new Animated.Value(1)).current;
  const animateGender = () => {
    Animated.sequence([
      Animated.timing(genderAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(genderAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Animasi Role
  const roleAnim = useRef(new Animated.Value(0)).current;
  const roleIndex =
    form.role === "Coach" ? 0 : form.role === "Athlete" ? 1 : -1;

  useEffect(() => {
    if (roleIndex >= 0) {
      Animated.timing(roleAnim, {
        toValue: roleIndex,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: false,
      }).start();
    }
  }, [roleIndex]);

  // Validasi email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validasi form
  const validateForm = async () => {
    let isValid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      gender: "",
      role: "",
    };

    // Validasi username
    if (!form.username.trim()) {
      newErrors.username = "Username harus diisi";
      isValid = false;
    } else if (form.username.length < 3) {
      newErrors.username = "Username minimal 3 karakter";
      isValid = false;
    }

    // Validasi email
    if (!form.email.trim()) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    // Validasi password
    if (!form.password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    } else if (form.password.length < 6) {
      newErrors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    // Validasi confirm password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Konfirmasi password harus diisi";
      isValid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Password tidak sama";
      isValid = false;
    }

    // Validasi gender
    if (!form.gender) {
      newErrors.gender = "Pilih gender terlebih dahulu";
      isValid = false;
    }

    // Validasi role
    if (!form.role) {
      newErrors.role = "Pilih role terlebih dahulu";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Cek username sudah ada atau belum
  const checkUsernameExists = async (username: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("username", username)
        .single();

      return data !== null;
    } catch {
      return false;
    }
  };

  // Cek email sudah ada atau belum
  const checkEmailExists = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("email")
        .eq("email", email)
        .single();

      return data !== null;
    } catch {
      return false;
    }
  };

  // Handle Register
  const handleRegister = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      Alert.alert("Error", "Mohon lengkapi semua field dengan benar");
      return;
    }

    setIsLoading(true);

    try {
      const usernameExists = await checkUsernameExists(form.username);
      if (usernameExists) {
        setErrors({ ...errors, username: "Username sudah terdaftar" });
        Alert.alert("Error", "Username sudah terdaftar");
        setIsLoading(false);
        return;
      }

      const emailExists = await checkEmailExists(form.email);
      if (emailExists) {
        setErrors({ ...errors, email: "Email sudah terdaftar" });
        Alert.alert("Error", "Email sudah terdaftar");
        setIsLoading(false);
        return;
      }

      // Generate OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      // Insert user
      const { data, error } = await supabase.from("users").insert([
        {
          username: form.username,
          email: form.email,
          password: form.password,
          gender: form.gender,
          role: form.role,
          otp_code: otpCode,
          otp_expiry: otpExpiry.toISOString(),
          is_verified: false,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        if (error.message.includes("duplicate key value")) {
          Alert.alert("Error", "Email atau username sudah terdaftar");
        } else {
          Alert.alert("Error", "Gagal mendaftarkan user");
        }
        console.error("Error inserting user:", error);
        setIsLoading(false);
        return;
      }

      console.log(`OTP untuk ${form.email}: ${otpCode}`);

      Alert.alert("Verifikasi Email", "Kode OTP telah dikirim ke email kamu!", [
        {
          text: "OK",
          onPress: () =>
            router.push({
              pathname: "./CekEmail",
              params: { email: form.email, username: form.username },
            }),
        },
      ]);
    } catch (error) {
      console.error("Register error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat registrasi");
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // Mapping field ke key form
  const fieldMap: Record<string, keyof typeof form> = {
    Username: "username",
    Email: "email",
    Password: "password",
    "Confirm password": "confirmPassword",
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/Welcome")}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Hello! Register to get started</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {Object.keys(fieldMap).map((field, i) => {
            const fieldKey = fieldMap[field];
            return (
              <View key={i}>
                <TextInput
                  placeholder={field}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={field.toLowerCase().includes("password")}
                  style={[
                    styles.input,
                    errors[fieldKey] ? styles.inputError : {},
                  ]}
                  value={form[fieldKey]}
                  onChangeText={(t) => {
                    setForm({ ...form, [fieldKey]: t });
                    // Clear error when user starts typing
                    if (errors[fieldKey]) {
                      setErrors({ ...errors, [fieldKey]: "" });
                    }
                  }}
                />
                {errors[fieldKey] ? (
                  <Text style={styles.errorText}>{errors[fieldKey]}</Text>
                ) : null}
              </View>
            );
          })}

          {/* Gender Section */}
          <View style={{ marginTop: 8 }}>
            <Text
              style={{
                fontFamily: "Urbanist-SemiBold",
                fontSize: 15,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Choose your gender
            </Text>
            <View style={styles.genderContainer}>
              {["Man", "Woman"].map((g) => {
                const active = form.gender === g;
                return (
                  <Animated.View
                    key={g}
                    style={{
                      flex: 1,
                      transform: [{ scale: active ? genderAnim : 1 }],
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        active && styles.genderActive,
                      ]}
                      onPress={() => {
                        setForm({ ...form, gender: g });
                        if (errors.gender) {
                          setErrors({ ...errors, gender: "" });
                        }
                        animateGender();
                      }}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          active && styles.genderTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>
            {errors.gender ? (
              <Text style={styles.errorText}>{errors.gender}</Text>
            ) : null}
          </View>

          {/* Role Selector */}
          <View style={{ marginTop: 18 }}>
            <Text
              style={{
                fontFamily: "Urbanist-SemiBold",
                fontSize: 15,
                color: "#111827",
                marginBottom: 10,
              }}
            >
              Choose your role
            </Text>
            <View style={styles.roleWrapper}>
              <Animated.View
                style={[
                  styles.roleHighlight,
                  {
                    left: roleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["2%", "52%"],
                    }),
                    opacity: form.role ? 1 : 0,
                  },
                ]}
              />
              {["Coach", "Athlete"].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.roleBtn}
                  onPress={() => {
                    setForm({ ...form, role: r });
                    if (errors.role) {
                      setErrors({ ...errors, role: "" });
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.roleText,
                      form.role === r && styles.roleTextActive,
                    ]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.role ? (
              <Text style={styles.errorText}>{errors.role}</Text>
            ) : null}
          </View>

          {/* Register Button */}
          <Animated.View
            style={{ transform: [{ scale: isPressed ? 0.98 : 1 }] }}
          >
            <TouchableOpacity
              style={[
                styles.registerButton,
                isLoading && styles.disabledButton,
              ]}
              activeOpacity={0.9}
              onPressIn={() => setIsPressed(true)}
              onPressOut={() => setIsPressed(false)}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.registerText}>Register</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Divider */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or Register with</Text>
            <View style={styles.line} />
          </View>

          {/* Social Login */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBox}>
              <GoogleIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBox}>
              <FontAwesome5 name="apple" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/Login")}>
              <Text style={styles.loginLink}> Login now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginTop: 20, marginBottom: 30 },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist-Bold",
    color: "#111827",
    marginTop: 40,
  },
  form: { gap: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: "Urbanist-Regular",
    fontSize: 15.5,
    backgroundColor: "#F9FAFB",
  },
  inputError: {
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontFamily: "Urbanist-Regular",
  },
  genderContainer: { flexDirection: "row", gap: 12 },
  genderButton: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  genderActive: { backgroundColor: "#112952", borderColor: "#112952" },
  genderText: { fontFamily: "Urbanist-Regular", color: "#111827" },
  genderTextActive: { color: "#fff", fontFamily: "Urbanist-Bold" },
  roleWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    position: "relative",
  },
  roleHighlight: {
    position: "absolute",
    top: 4,
    bottom: 4,
    width: "46%",
    backgroundColor: "#112952",
    borderRadius: 10,
  },
  roleBtn: { flex: 1, alignItems: "center", paddingVertical: 12 },
  roleText: { fontFamily: "Urbanist-Regular", color: "#111827" },
  roleTextActive: { color: "#fff", fontFamily: "Urbanist-Bold" },
  registerButton: {
    backgroundColor: "#112952",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    shadowColor: "#0C1E3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 7,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerText: {
    color: "#fff",
    fontFamily: "Urbanist-SemiBold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    marginTop: -10,
  },
  orText: {
    fontFamily: "Urbanist-Regular",
    fontSize: 14,
    color: "#36383a",
    marginHorizontal: 8,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  socialContainer: { flexDirection: "row", justifyContent: "center", gap: 16 },
  socialBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginRow: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
  loginText: { fontFamily: "Urbanist-Regular", color: "#6B7280" },
  loginLink: { fontFamily: "Urbanist-Bold", color: "#112952" },
});
