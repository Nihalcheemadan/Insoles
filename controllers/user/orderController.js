const addressSchema = require("../../models/user/addressSchema");
const cartModel = require("../../models/user/cartModel");
const orderSchema = require("../../models/user/orderSchema");
const Razorpay = require("razorpay");

var instance = new Razorpay({
  key_id: "rzp_test_mp1q8YWcYr4vEC",
  key_secret: "RV5KxjCb2F6JQwSsoMxADYxs",
});

module.exports = {
  //checkout

  checkout: async (req, res) => {
    try{

      let userId = req.session.user._id;
  
      let cart = await cartModel
        .findOne({ userId: userId })
        .populate("products.productId");
      let address = await addressSchema.findOne({ userId });
  
      if (cart != null && cart.products.length > 0) {
        let cartTotal = cart.cartTotal;
        let cartItems = cart.products;
        let cartId = cart._id
        let discount =  cart.offer.discount
        console.log("njkdxiusaihduasi"+cart);
        address = address ? address.address : 0;
        let length = address ? address.length : 0;
        let index = req.body.index ? req.body.index : length - 1;
  
        res.render("user/checkout", { discount ,cartId , cartTotal, cartItems, address, index });
      } else {
        res.redirect("/login/cart");
      }
    }catch{
      res.render('error')
    }
  },

  //place an order

  placeOrder: async (req, res) => {
    let userId = req.session.user._id;
    let adrsIndex = req.body["index"];
    console.log("adrsIndex" + adrsIndex);
    let paymentMethod = req.body["paymentMethod"];
    let addresses = await addressSchema.findOne({ userId });
    let address = addresses.address[adrsIndex];
    let cart = await cartModel.findOne({ userId });
    let total = cart.cartTotal;
    let products = cart.products;

    const newOrder = new orderSchema({
      userId,
      products,
      total,
      address,
      paymentMethod,
    });
    newOrder.save().then(async () => {
      // await cartModel.findByIdAndDelete({ _id: cart._id });
      console.log(newOrder);
    });
    let orderId = newOrder._id;
    total = newOrder.total;

    if (paymentMethod == "COD") {
      await cartModel.findByIdAndDelete({ _id: cart._id });
      res.json({ codSuccess: true });
    } else {
      return new Promise(async (resolve, reject) => {
        instance.orders.create(
          {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId,
          },
          function (err, order) {
            resolve(order);
          }
        );
      }).then(async (response) => {
        res.json(response);
      });
    }
  },

  // verify payment

  verifyPayment: async (req, res) => {
    let cart = await cartModel.findOne({ userId });
    console.log(req.body);
    const crypto = require("crypto");
    let details = req.body;
    console.log(details);
    let hmac = crypto.createHmac("sha256", "RV5KxjCb2F6JQwSsoMxADYxs");
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac === details.payment.razorpay_signature) {
      let orderId = details.order.receipt;
      await orderSchema.findOneAndUpdate(
        { _id: orderId },
        { $set: { paymentStatus: "paid" } }
      );
      await cartModel.findByIdAndDelete({ _id: cart._id });
      res.json({ status: true });
    } else {
      res.json({ status: false });
    }
  },

  //checkout page new address updation

  checkoutNewAddress: async (req, res) => {
    let userId = req.session.user._id;
    const { fullName, houseName, city, state, pincode, phone } = req.body;
    let exist = await addressSchema.findOne({ userId: userId });
    if (exist) {
      await addressSchema
        .findOneAndUpdate(
          { userId },
          {
            $push: {
              address: { fullName, houseName, city, state, pincode, phone },
            },
          }
        )
        .then(() => {
          res.redirect("/login/checkout");
        });
    } else {
      const address = new addressSchema({
        userId,
        address: [{ fullName, houseName, city, state, pincode, phone }],
      });
      await address
        .save()
        .then(() => {
          res.redirect("/login/checkout");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  },

  //order success

  orderSuccess: (req, res) => {
    res.render("user/orderSuccess");
  },

  //order management

  orders: async (req, res) => {
    let userId = req.session.user._id;
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 5;
    const totalproducts = await orderSchema.find().countDocuments();
    const orders = await orderSchema
      .find({userId:userId})
      .populate("products.productId").sort({date:-1})
      .skip((page-1)*items_per_page).limit(items_per_page)

      

      console.log(orders);
      if(orders){
        res.render("user/orders", {
          
          orders,
          index: 1,
          page,
          hasNextPage: items_per_page * page < totalproducts,
          hasPreviousPage: page > 1,
          PreviousPage: page - 1,
        });
      }else{
        res.render("user/orders", { orders: [] });
      }
    
  },

  //cancel order

  cancelOrder:async(req,res)=>{
    
    let response = await orderSchema.findOneAndUpdate(
      { _id: req.body['id'] },
      { $set: { orderStatus: "Cancelled" } }
    );
    console.log(response);
    res.json({status:true})
  }
};
