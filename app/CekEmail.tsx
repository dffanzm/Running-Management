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
  const [timer, setTimer] = useState(600); // 10 menit dalam detik
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

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle OTP input
  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedCode = value.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedCode.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);

      // Focus last input or next empty
      const lastIndex = Math.min(pastedCode.length - 1, 5);
      inputRefs.current[lastIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Animasi tombol
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

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      Alert.alert("Error", "Masukkan kode OTP 6 digit");
      return;
    }

    setIsLoading(true);
    animateButton();

    try {
      // Cek OTP di database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .eq("otp_code", otpCode)
        .single();

      if (error || !data) {
        Alert.alert("Error", "Kode OTP tidak valid");
        setIsLoading(false);
        return;
      }

      // Cek apakah OTP expired
      const otpExpiry = new Date(data.otp_expiry);
      const now = new Date();

      if (now > otpExpiry) {
        Alert.alert("Error", "Kode OTP sudah kadaluarsa");
        setIsLoading(false);
        return;
      }

      // Update status verified
      const { error: updateError } = await supabase
        .from("users")
        .update({
          is_verified: true,
          otp_code: null,
          otp_expiry: null,
        })
        .eq("email", email);

      if (updateError) {
        Alert.alert("Error", "Gagal verifikasi email");
      } else {
        Alert.alert("Berhasil!", "Email berhasil diverifikasi", [
          {
            text: "OK",
            onPress: () => router.push("/Login"),
          },
        ]);
      }
    } catch (error) {
      console.error("Verify error:", error);
      Alert.alert("Error", "Terjadi kesalahan saat verifikasi");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsLoading(true);

    try {
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date();
      otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

      // Update OTP di database
      const { error } = await supabase
        .from("users")
        .update({
          otp_code: newOtp,
          otp_expiry: otpExpiry.toISOString(),
        })
        .eq("email", email);

      if (error) {
        Alert.alert("Error", "Gagal mengirim ulang OTP");
      } else {
        // Reset timer
        setTimer(600);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);

        // Untuk testing, tampilkan OTP di console
        console.log(`OTP baru untuk ${email}: ${newOtp}`);

        Alert.alert("Berhasil", "Kode OTP baru telah dikirim ke email Anda");
      }
    } catch (error) {
      console.error("Resend error:", error);
      Alert.alert("Error", "Gagal mengirim ulang OTP");
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
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={22} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Icon Email */}
            <View style={styles.iconContainer}>
              <View style={styles.emailIcon}>
                <Ionicons name="mail-outline" size={48} color="#112952" />
              </View>
            </View>

            {/* Title */}
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
                  ref={(ref) => (inputRefs.current[index] = ref)}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : {}]}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="numeric"
                  maxLength={6}
                  selectTextOnFocus
                />
              ))}
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                Kode akan kadaluarsa dalam {formatTime(timer)}
              </Text>
            </View>

            {/* Verify Button */}
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

            {/* Resend Code */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Tidak menerima kode?</Text>
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={!canResend || isLoading}
              >
                <Text
                  style={[
                    styles.resendLink,
                    !canResend && styles.resendLinkDisabled,
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginTop: 20,
    marginBottom: 20,
  },
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
  iconContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
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
  timerContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  timerText: {
    fontSize: 14,
    fontFamily: "Urbanist-Regular",
    color: "#6B7280",
  },
  buttonContainer: {
    marginBottom: 24,
  },
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
  disabledButton: {
    opacity: 0.7,
  },
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
  resendLinkDisabled: {
    color: "#9CA3AF",
  },
});
