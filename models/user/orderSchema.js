const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderModel = new mongoose.Schema({
  userId: {
    type: ObjectId,
    required: true,
  },
  products: [
    {
      productId: { type: ObjectId, ref: "product" },
      quantity: { type: Number },
      total: { type: Number, required: true },
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  address: {
    type: ObjectId,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentStatus: {
    type: String,
    default: "Pending",
  },
  orderStatus: {
    type: String,
    default: "Order Placed",
    enum: ["Order Placed", "Shipped", "Delivered", "Cancelled"],
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = orderSchema = mongoose.model("order", orderModel);
