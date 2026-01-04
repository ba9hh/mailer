import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import mongoose from "mongoose"
import multer from "multer";
import supabase from "./supabaseClient.js";
import { protect } from "./middleware/authMiddleware.js";
import nodemailer from 'nodemailer';
import { Resend } from "resend";

const resend = new Resend("re_762PrZgg_2EE7B8GWTDJeryAUmVYvnHAZ");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: 'zedtourheart@gmail.com', // Your email
    pass: 'kjqk ssnh ozdc ajsj',      // Your email password
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000,
});
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
const upload = multer({ storage: multer.memoryStorage() });
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// app.post("/send-email", async (req, res) => {
//   console.log("📩 /send-email called");

//   res.setTimeout(60000);

//   const mailOptions = {
//     from: "zedtourheart@gmail.com",
//     to: "ezedinejlidi3@gmail.com",
//     subject: "Commande",
//     text: "Vous avez une commande",
//   };

//   try {
//     console.log("⏳ Sending email...");
//     await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent");

//     res.json({ success: true });
//   } catch (err) {
//     console.error("❌ Email error:", err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });
app.post("/send-email", async (req, res) => {
  try {
    const { recipientEmail, recipientName, senderName, messageContent, bookName } = req.body;

    // Input validation
    if (!recipientEmail || !recipientName || !senderName || !messageContent || !bookName) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields"
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return res.status(400).json({
        success: false,
        error: "Invalid email address"
      });
    }

    // Create a more detailed email
    const emailSubject = `Nouvelle message de ${senderName}`;
    const emailText = `
Bonjour ${recipientName},

Vous avez reçu une nouvelle message:

Livre: ${bookName}
De: ${senderName}
Message: ${messageContent}

Cordialement,
L'équipe Ktebna Tunisie
    `.trim();

    // HTML version for better presentation
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Nouvelle message</h2>
        <p>Bonjour <strong>${recipientName}</strong>,</p>
        <p>Vous avez reçu une nouvelle message:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Livre:</strong> ${bookName}</p>
          <p><strong>De:</strong> ${senderName}</p>
          <p><strong>Message:</strong> ${messageContent}</p>
        </div>
        <p style="color: #666;">Cordialement,<br>L'équipe Ktebna Tunisie</p>
      </div>
    `;

    await resend.emails.send({
      from: "notifications@dyaritunisie.com",
      to: [recipientEmail],
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
    });

    res.json({ success: true, message: "Email sent successfully" });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to send email. Please try again later."
    });
  }
});
mongoose
  .connect("mongodb+srv://ezedinejlidi3:test123@cluster0.efcile8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => {
    console.log('App connected to database');

  })
  .catch((error) => {
    console.log(error);
  });
// Routes
app.get("/", (req, res) => {
  res.send("Express backend is running 🚀");
});

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { file } = req;
    console.log(file);
    const fileName = `${Date.now()}-${file.originalname}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images') // Replace with your bucket name
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Upload failed' });
    }

    // Get the public URL (if the bucket is public)
    const publicUrl = `${supabase.storageUrl}/object/public/images/${fileName}`;

    res.status(200).json({ message: 'File uploaded successfully', url: publicUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
// Example API route
app.get("/api/users", (req, res) => {
  res.json([{ id: 1, name: "Ezedine" }, { id: 2, name: "Sarah" }]);
});
app.get("/api/auth/me", protect, async (req, res) => {
  res.json(req.user);
});
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
