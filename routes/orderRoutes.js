import express from "express";
import { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder } from "../controllers/orderControllers.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, adminOnly, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, adminOnly, updateOrderStatus);
router.delete("/:id", protect, adminOnly, deleteOrder);

export default router;