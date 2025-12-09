import {
  Urbanist_400Regular,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert, // Tetap diimport untuk jaga-jaga, tapi kita pakai alert biasa untuk web
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { supabase } from "../Database/supabaseClient";
import AsyncStorage from '@react-native-async-storage/async-storage';

// ================= Google Icon Component =================
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

// ================= Login Component =================
const Login = () => {
  // ---------- Fonts ----------
  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
    "Urbanist-SemiBold": Urbanist_600SemiBold,
  });

  // ---------- States ----------
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setPasswordVisible] = useState(false);

  // ---------- Validation ----------
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { email: "", password: "" };

    if (!form.email.trim()) {
      newErrors.email = "Email harus diisi";
      isValid = false;
    } else if (!validateEmail(form.email)) {
      newErrors.email = "Format email tidak valid";
      isValid = false;
    }

    if (!form.password) {
      newErrors.password = "Password harus diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // ---------- Handle Login (Versi FIX & Stabil) ----------
  const handleLogin = async () => {
    // 1. Cek Validasi Form
    if (!validateForm()) return;

    setIsLoading(true);

    // 2. Bersihkan Input (Hapus Spasi & Kecilkan Huruf Email)
    const cleanEmail = form.email.trim().toLowerCase();
    const cleanPassword = form.password.trim();

    console.log("Mencoba login:", cleanEmail);

    try {
      // 3. Cek ke Database Supabase
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", cleanEmail)
        .eq("password", cleanPassword)
        .maybeSingle();

      if (error || !data) {
        // Gagal Login: Gunakan 'alert' biasa (kecil hurufnya) agar muncul di Web Browser & HP
        alert("Login Gagal! Email atau Password salah.");
      } else {
        // --- LOGIN SUKSES ---
        console.log("Login sukses, menyimpan sesi...");
        
        // 4. Simpan Data User ke HP
        try {
          await AsyncStorage.setItem('userSession', JSON.stringify(data));
        } catch (e) {
          console.error("Gagal simpan session", e);
        }

        // 5. LANGSUNG PINDAH HALAMAN (Tanpa Pop-up 'OK' yang bikin macet)
        router.replace("/Home");
      }
    } catch (err) {
      console.error("System Error:", err);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Loading View ----------
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#112952" />
      </View>
    );
  }

  // ================= Render UI =================
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
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Welcome!</Text>
        </View>

        {/* Form Area */}
        <View style={styles.form}>
          
          {/* Input Email */}
          <View>
            <TextInput
              placeholder="Enter your email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, errors.email ? styles.inputError : {}]}
              value={form.email}
              onChangeText={(t) => {
                setForm({ ...form, email: t });
                if (errors.email) setErrors({ ...errors, email: "" });
              }}
            />
            {errors.email ? (
              <Text style={styles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          {/* Input Password */}
          <View>
            <View
              style={[
                styles.input,
                styles.passwordContainer,
                errors.password ? styles.inputError : {},
              ]}
            >
              <TextInput
                placeholder="Enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry={!isPasswordVisible}
                style={styles.passwordInput}
                value={form.password}
                onChangeText={(t) => {
                  setForm({ ...form, password: t });
                  if (errors.password) setErrors({ ...errors, password: "" });
                }}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#6B7280"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text style={styles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity onPress={() => router.push("/ForgotPassword")}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.disabledButton]}
            activeOpacity={0.8}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Divider 'Or Login With' */}
          <View style={styles.orContainer}>
            <View style={styles.line} />
            <Text style={styles.orText}>Or Login with</Text>
            <View style={styles.line} />
          </View>

          {/* Social Media Buttons */}
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialBox}>
              <GoogleIcon />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBox}>
              <FontAwesome5 name="apple" size={26} color="#000" />
            </TouchableOpacity>
          </View>

          {/* Register Link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/Register")}>
              <Text style={styles.registerLink}>Register now</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;

// ================= Styles =================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginTop: 20, marginBottom: 40 },
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
    fontSize: 32,
    fontFamily: "Urbanist-Bold",
    color: "#111827",
    marginTop: 40,
  },
  form: { gap: 18 },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontFamily: "Urbanist-SemiBold",
    fontSize: 15,
    backgroundColor: "#F9FAFB",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  passwordInput: {
    flex: 1,
    fontFamily: "Urbanist-SemiBold",
    fontSize: 15,
    paddingVertical: 10,
  },
  inputError: { borderColor: "#EF4444" },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 4,
    fontFamily: "Urbanist-Regular",
  },
  forgotPasswordText: {
    fontFamily: "Urbanist-SemiBold",
    color: "#112952",
    textAlign: "right",
    fontSize: 14,
    marginTop: -8,
  },
  loginButton: {
    backgroundColor: "#112952",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#0C1E3C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  disabledButton: { opacity: 0.7 },
  loginButtonText: { color: "#fff", fontFamily: "Urbanist-Bold", fontSize: 16 },
  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
  },
  orText: {
    fontFamily: "Urbanist-SemiBold",
    fontSize: 14,
    color: "#9CA3AF",
    marginHorizontal: 12,
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E7EB" },
  socialContainer: { flexDirection: "row", justifyContent: "center", gap: 20 },
  socialBox: {
    flex: 1,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
    alignItems: "center",
  },
  registerText: {
    fontFamily: "Urbanist-Regular",
    color: "#6B7280",
    fontSize: 15,
  },
  registerLink: {
    fontFamily: "Urbanist-Bold",
    color: "#112952",
    fontSize: 15,
    marginLeft: 6,
  },
});