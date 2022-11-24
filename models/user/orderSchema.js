const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const orderSchema = new mongoose.Schema({
  userId: {
    type:ObjectId,
    required:true,
    ref:"userdata"

  },
  products:[{
    productId: { type : ObjectId , ref: 'product'},
    quantity: {type:Number},
    total: {type:Number , required : true}
  }],
  total:{
    type:Number,
    required:true
},
  address: {
    type: ObjectId,
    required: true,
    ref: "userAddress",
  },
  paymentMethod: {
    type: String,
    required:true
  },
  paymentStatus : {
    type:String,
    default: "Pending"
  },
  orderStatus: {
    type: String,
    default:'Order Placed'
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = order = mongoose.model("order", orderSchema);
