import cors from "cors";
import express from "express";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(express.json());

// Gunakan App Password Gmail (bukan password biasa)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "runease.app@gmail.com", // ganti dengan email kamu
    pass: "bnno ojdw oyny gcop",
  },
});

app.post("/send-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    await transporter.sendMail({
      from: `"RunAnywhere" <emailkamu@gmail.com>`,
      to: email,
      subject: "Kode OTP Verifikasi",
      text: `Kode OTP kamu adalah ${otp}. Berlaku selama 10 menit.`,
    });

    console.log(`OTP dikirim ke ${email}: ${otp}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Gagal kirim email:", error);
    res.status(500).json({ error: "Gagal kirim email" });
  }
});

app.listen(5000, () => console.log("✅ Server jalan di port 5000"));
