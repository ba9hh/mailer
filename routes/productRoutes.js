import express from "express";
import { createProduct, getProducts,getProductsByCategory, getProductBySlug, updateProduct, deleteProduct } from "../controllers/productControllers.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",  createProduct);
router.get("/", getProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.put("/:id",  updateProduct);
router.delete("/:id",  deleteProduct);

export default router;