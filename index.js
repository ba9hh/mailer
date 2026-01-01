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


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'zedtourheart@gmail.com', // Your email
    pass: 'kjqk ssnh ozdc ajsj',      // Your email password
  },
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

app.post("/send-email", async (req, res) => {
  const mailOptions = {
    from: 'zedtourheart@gmail.com',
    to: 'ezedinejlidi3@gmail.com',
    subject: 'Commande',
    text: `Vous avez une commande`,
  };

  try {
    await transporter.sendMail(mailOptions);


    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
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
