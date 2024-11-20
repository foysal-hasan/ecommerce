import asyncHandler from "../middlewares/asyncHandler.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";
import { calculatePrices } from "../utils/calculatePrices.js";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();
import SSLCommerzPayment from "sslcommerz-lts";
const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; //true for live, false for sandbox

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate("user", "name email");
  res.status(200).json(orders);
});

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;
  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error("No order items");
  } else {
    const productIds = orderItems.map((x) => x._id);
    const itemsFromDB = await Product.find({
      _id: { $in: productIds },
    });

    // map over the order items and use the price from our items from database
    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );
      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      };
    });

    // calculate prices
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
      calculatePrices(dbOrderItems);

    const order = await Order.create({
      orderItems: dbOrderItems,
      user: req.user._id,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    res.status(201).json(order);
  }
});

export const payment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name");

  if (!order) {
    res.status(404);
    throw new Error("Order Not Found");
  }

  const tran_id = crypto.randomUUID();
  order.tran_id = tran_id;
  // Payment data to send to SSLCommerz
  const data = {
    total_amount: order.totalPrice,
    currency: "BDT",
    tran_id: tran_id,
    success_url: `${process.env.SERVER_API}/api/orders/${tran_id}/success`,
    fail_url: `${process.env.SERVER_API}/api/orders/${tran_id}/fail`,
    cancel_url: `${process.env.SERVER_API}/api/orders/${tran_id}/cancel`,
    ipn_url: ``,
    shipping_method: "Courier",
    product_name: "gruop product",
    product_category: "Electronic",
    product_profile: "general",
    cus_name: "Customer Name",
    cus_email: "planDetails.user_email",
    cus_add1: "Dhaka",
    cus_add2: "Dhaka",
    cus_city: "Dhaka",
    cus_state: "Dhaka",
    cus_postcode: "1000",
    cus_country: "Bangladesh",
    cus_phone: "01711111111",
    cus_fax: "01711111111",
    ship_name: order.user.name,
    ship_add1: order.shippingAddress.address,
    ship_add2: "Dhaka",
    ship_city: order.shippingAddress.city,
    ship_state: "Dhaka",
    ship_postcode: order.shippingAddress.postalCode,
    ship_country: order.shippingAddress.country,
  };

  // Initialize SSLCommerz payment
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

  const apiResponse = await sslcz.init(data);
  // console.log(apiResponse);
  await order.save();
  let GatewayPageURL = apiResponse.GatewayPageURL;
  res.status(201).json({ url: GatewayPageURL });
});

export const updateOrderToPay = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ tran_id: req.params.id });
  if (!order) {
    res.status(401);
    throw new Error("No order found");
  }

  order.isPaid = true;
  order.paidAt = Date.now();
  await order.save();
  res.redirect(`${process.env.FRONTEND_URL}/orders/${order._id}`);
});

export const paymentFail = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ tran_id: req.params.id });
  if (!order) {
    res.status(401);
    throw new Error("No order found");
  }
  res.redirect(`${process.env.FRONTEND_URL}/orders/${order._id}`);
});

export const paymentCancel = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ tran_id: req.params.id });
  if (!order) {
    res.status(401);
    throw new Error("No order found");
  }
  res.redirect(`${process.env.FRONTEND_URL}/orders/${order._id}`);
});

export const updateOrderToDelivered = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isDelivered = true;
    order.deliveredAt = Date.now();

    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error("Order not found");
  }
});

export const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );
  if (!order) {
    res.status(404);
    throw new Error("Order Not Found");
  }
  res.status(200).json(order);
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});
