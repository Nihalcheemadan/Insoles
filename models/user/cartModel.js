const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "userdata",
  },
  // products: {
  //   type: [
  //     {
  //       productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
  //       quantity: { type: Number, default: 1 },  
  //       date: { type: Date, default: Date.now },
  //     },
  //   ],
  // },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product'},
    quantity: { type: Number, default: 1 },
    total : {type:Number,required:true},
    date: { type: Date, default: Date.now }
}],
  cartTotal:{
    type:Number,
  },
  
});

module.exports = cartModel = mongoose.model("cart", cartSchema);