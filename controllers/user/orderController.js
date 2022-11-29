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
    let userId = req.session.user._id;

    let cart = await cartModel
      .findOne({ userId: userId })
      .populate("products.productId");
    let address = await addressSchema.findOne({ userId });

    if (cart != null && cart.products.length > 0) {
      let cartTotal = cart.cartTotal;
      let cartItems = cart.products;
      address = address ? address.address : 0;
      let length = address ? address.length : 0;
      let index = req.body.index ? req.body.index : length - 1;

      res.render("user/checkout", { cartTotal, cartItems, address, index });
    } else {
      res.redirect("/login/cart");
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
    console.log("nowkjbfwugewufiwuh" + orderId, total);
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
    if (cart) {
      console.log(req.body);
      const crypto = require("crypto");
      let details = req.body;
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
      }
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
};
