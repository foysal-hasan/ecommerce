import express from "express";
import {
  createOrder,
  getAllOrders,
  myOrders,
  getSingleOrder,
  updateOrderToPay,
  updateOrderToDelivered,
  payment,
  paymentFail,
  paymentCancel,
} from "../controllers/orderController.js";
import { admin, protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

// router.use(protect);

router.route("/").post(protect, createOrder).get(protect, admin, getAllOrders);
router.route("/myorders").get(protect, myOrders);
router.route("/:id").get(protect, getSingleOrder);
router.route("/:id/payment").post(protect, payment);
router.route("/:id/success").post(updateOrderToPay);
router.route("/:id/fail").post(paymentFail);
router.route("/:id/cancel").post(paymentCancel);
router.route("/:id/deliver").put(protect, admin, updateOrderToDelivered);

export default router;
