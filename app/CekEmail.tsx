// app/CekEmail.tsx
import {
  Urbanist_400Regular,
  Urbanist_600SemiBold,
  Urbanist_700Bold,
  useFonts,
} from "@expo-google-fonts/urbanist";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../Database/supabaseClient";

// ✅ IP Address yang benar dari WiFi
const BACKEND_URL = "http://192.168.1.23:5000";

const CekEmail = () => {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const username = params.username as string;

  const [fontsLoaded] = useFonts({
    "Urbanist-Bold": Urbanist_700Bold,
    "Urbanist-Regular": Urbanist_400Regular,
    "Urbanist-SemiBold": Urbanist_600SemiBold,
  });

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 menit
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // OTP input handler
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedCode.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      const lastIndex = Math.min(pastedCode.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ✅ Verifikasi OTP (FIXED - Timezone aware)
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Masukkan kode OTP 6 digit");
      return;
    }

    setIsLoading(true);
    animateButton();

    try {
      console.log("🔐 Verifying OTP:", otpCode);
      console.log("📧 Email:", email);

      // 1️⃣ Ambil data user dari database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (error || !data) {
        console.error("❌ User tidak ditemukan:", error);
        Alert.alert("Error", "User tidak ditemukan");
        setIsLoading(false);
        return;
      }

      console.log("✅ User found:", data.username);
      console.log("🔑 Stored OTP:", data.otp_code);

      // 2️⃣ Cek apakah OTP cocok
      if (data.otp_code !== otpCode) {
        console.error("❌ OTP tidak cocok");
        console.error("Expected:", data.otp_code);
        console.error("Received:", otpCode);
        Alert.alert("Error", "Kode OTP tidak valid");
        setIsLoading(false);
        return;
      }

      console.log("✅ OTP match!");

      // 3️⃣ Cek apakah OTP sudah kadaluarsa (UTC comparison)
      const otpExpiryUTC = new Date(data.otp_expiry);
      const nowUTC = new Date();

      console.log("🕒 OTP Expiry (UTC):", otpExpiryUTC.toISOString());
      console.log("🕒 Current Time (UTC):", nowUTC.toISOString());

      const diffMs = otpExpiryUTC.getTime() - nowUTC.getTime();
      const diffSeconds = Math.floor(diffMs / 1000);

      console.log("⏱️  Selisih (ms):", diffMs);
      console.log("⏱️  Selisih (seconds):", diffSeconds);
      console.log(diffMs > 0 ? "✅ OTP masih valid" : "❌ OTP expired");

      if (nowUTC > otpExpiryUTC) {
        console.error("❌ OTP sudah kadaluarsa");
        Alert.alert("Error", "Kode OTP sudah kadaluarsa. Silakan kirim ulang.");
        setIsLoading(false);
        return;
      }

      // 4️⃣ Update user menjadi verified
      console.log("📝 Updating user as verified...");
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_verified: true,
          otp_code: null,
          otp_expiry: null,
        })
        .eq("email", email);

      if (updateError) {
        console.error("❌ Gagal update user:", updateError);
        Alert.alert("Error", "Gagal verifikasi email");
        setIsLoading(false);
        return;
      }

      // 5️⃣ Berhasil!
      console.log("✅ Email berhasil diverifikasi!");
      setIsLoading(false);

      Alert.alert(
        "Berhasil!",
        "Email berhasil diverifikasi",
        [
          {
            text: "OK",
            onPress: () => router.replace("/Login"),
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("❌ Verify error:", error);
      const errorDetails =
        error instanceof Error
          ? { name: error.name, message: error.message }
          : { name: "UnknownError", message: String(error) };
      console.error("Error details:", errorDetails);
      Alert.alert("Error", "Terjadi kesalahan saat verifikasi");
      setIsLoading(false);
    }
  };

  // 🔁 Resend OTP via Backend (FIXED)
  const handleResendOtp = async () => {
    if (!canResend) return;
    setIsLoading(true);

    try {
      console.log("🔄 Mengirim ulang OTP ke:", email);
      console.log("📡 Request URL:", `${BACKEND_URL}/send-otp`);

      const response = await fetch(`${BACKEND_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      console.log("📡 Response status:", response.status);

      if (!response.ok) {
        console.error("❌ Backend response not OK:", response.status);
        Alert.alert("Error", "Gagal menghubungi server");
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      console.log("📦 Backend response:", data);

      if (data.success) {
        console.log("✅ OTP baru berhasil dikirim");

        // Reset timer dan OTP input
        setTimer(300); // 5 menit
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);

        // Focus ke input pertama
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);

        Alert.alert("Berhasil", "Kode OTP baru telah dikirim ke email Anda");
      } else {
        console.error("❌ Backend error:", data.message);
        Alert.alert("Error", data.message || "Gagal kirim ulang OTP");
      }
    } catch (err) {
      console.error("❌ Resend error:", err);
      // Safely extract error details from an unknown value
      const errorDetails =
        err instanceof Error
          ? { name: err.name, message: err.message }
          : { name: "UnknownError", message: String(err) };
      console.error("Error details:", errorDetails);
      Alert.alert(
        "Error",
        "Tidak dapat terhubung ke server. Pastikan backend sudah berjalan."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#112952" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.content}>
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.iconContainer}>
              <View style={styles.emailIcon}>
                <Ionicons name="mail-outline" size={48} color="#112952" />
              </View>
            </View>

            <Text style={styles.title}>Verifikasi Email</Text>
            <Text style={styles.subtitle}>
              Kami telah mengirim kode verifikasi ke
            </Text>
            <Text style={styles.email}>{email}</Text>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : {}]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                Kode akan kadaluarsa dalam {formatTime(timer)}
              </Text>
            </View>

            <Animated.View
              style={[
                styles.buttonContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  isLoading && styles.disabledButton,
                ]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifyButtonText}>Verifikasi</Text>
                )}
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Tidak menerima kode?</Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={!canResend || isLoading}
              >
                <Text
                  style={[
                    styles.resendLink,
                    (!canResend || isLoading) && styles.resendLinkDisabled,
                  ]}
                >
                  {" "}
                  Kirim ulang
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CekEmail;

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, paddingHorizontal: 24 },
  header: { marginTop: 20, marginBottom: 20 },
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
  iconContainer: { alignItems: "center", marginBottom: 24 },
  emailIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontFamily: "Urbanist-Bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Urbanist-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 4,
  },
  email: {
    fontSize: 15,
    fontFamily: "Urbanist-SemiBold",
    color: "#112952",
    textAlign: "center",
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    fontSize: 20,
    fontFamily: "Urbanist-SemiBold",
    textAlign: "center",
    backgroundColor: "#F9FAFB",
  },
  otpInputFilled: {
    borderColor: "#112952",
    backgroundColor: "#fff",
  },
  timerContainer: { alignItems: "center", marginBottom: 24 },
  timerText: {
    fontSize: 14,
    fontFamily: "Urbanist-Regular",
    color: "#6B7280",
  },
  buttonContainer: { marginBottom: 24 },
  verifyButton: {
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
  disabledButton: { opacity: 0.7 },
  verifyButtonText: {
    color: "#fff",
    fontFamily: "Urbanist-SemiBold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  resendText: {
    fontSize: 14,
    fontFamily: "Urbanist-Regular",
    color: "#6B7280",
  },
  resendLink: {
    fontSize: 14,
    fontFamily: "Urbanist-SemiBold",
    color: "#1D4ED8",
  },
  resendLinkDisabled: { color: "#9CA3AF" },
});
