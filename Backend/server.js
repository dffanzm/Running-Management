const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

// === KONFIGURASI SUPABASE ===
const SUPABASE_URL = "https://wsrggcpkolmydmjqmhqc.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzcmdnY3Brb2xteWRtanFtaHFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NDQ0NDMsImV4cCI6MjA3NjUyMDQ0M30.D361S2ySY19mNfsonTIfz-E1X_0bg-3tVubFdJZoEqw";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// === SETUP EXPRESS ===
const app = express();
app.use(cors());
app.use(express.json()); // ✅ lebih stabil dari bodyParser.json()
app.use(express.urlencoded({ extended: true })); // ✅ handle form-data

// === KONFIGURASI EMAIL ===
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "runease.app@gmail.com",
    pass: "anqe ydgm vvzo uthm",
  },
});

// ✅ Test koneksi email saat server start
transporter.verify((error, success) => {
  if (error) console.error("❌ Email transporter error:", error);
  else console.log("✅ Email server ready");
});

// === API: KIRIM OTP ===
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body; // ⬅️ Sekarang req.body pasti kebaca

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email harus diisi",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid",
      });
    }

    console.log(
      `\n📧 [${new Date().toISOString()}] Request OTP untuk: ${email}`
    );

    // 1️⃣ Cek apakah user ada di database
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, username")
      .eq("email", email)
      .single();

    if (userError || !userData) {
      console.error("❌ User tidak ditemukan:", email);
      return res.status(404).json({
        success: false,
        message: "Email tidak terdaftar",
      });
    }

    console.log("✅ User ditemukan:", userData.username);

    // 2️⃣ Generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 3️⃣ Waktu kadaluarsa 5 menit (UTC)
    const now = new Date();
    const otpExpiry = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Expiry: ${otpExpiry}`);

    // 4️⃣ Simpan OTP & expiry ke Supabase
    const { error: updateError } = await supabase
      .from("users")
      .update({ otp_code: otp, otp_expiry: otpExpiry })
      .eq("email", email);

    if (updateError) {
      console.error("❌ Gagal update Supabase:", updateError);
      return res.status(500).json({
        success: false,
        message: "Gagal menyimpan OTP di database",
      });
    }

    console.log("✅ OTP saved to database");

    // 5️⃣ Kirim email
    const mailOptions = {
      from: "RunEase <runease.app@gmail.com>",
      to: email,
      subject: "🔐 Kode OTP Verifikasi Akun - RunEase",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #112952;">Verifikasi Akun RunEase</h2>
          <p>Halo <strong>${userData.username}</strong>,</p>
          <p>Gunakan kode OTP berikut untuk verifikasi akun kamu:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px;">
            <h1 style="color: #112952; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #ef4444; font-weight: bold;">⏰ Kode ini berlaku selama 5 menit.</p>
          <p>Jika kamu tidak melakukan pendaftaran, abaikan email ini.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Email berhasil dikirim ke ${email}`);
    console.log("=".repeat(60));

    return res.status(200).json({
      success: true,
      message: "OTP berhasil dikirim",
    });
  } catch (error) {
    console.error("❌ Error saat proses OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
});

// === API: Health Check ===
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    message: "Backend RunEase is running",
  });
});

// === 404 Handler ===
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint tidak ditemukan",
  });
});

// === Helper: Get local IP address ===
const getLocalIP = () => {
  const { networkInterfaces } = require("os");
  const nets = networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === "IPv4" && !net.internal) {
        return net.address;
      }
    }
  }
  return "localhost";
};

// === Jalankan Server ===
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log("\n" + "=".repeat(60));
  console.log("🚀 RunEase Backend Server");
  console.log("=".repeat(60));
  console.log(`✅ Server running on port: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`🌐 Network: http://${localIP}:${PORT}`);
  console.log("=".repeat(60) + "\n");
});

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down server gracefully...");
  process.exit(0);
});
