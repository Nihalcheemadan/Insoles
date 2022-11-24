const addressSchema = require("../../models/user/addressSchema");
const cartModel = require("../../models/user/cartModel");
const orderSchema = require("../../models/user/orderSchema");

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
      await cartModel.findByIdAndDelete({ _id: cart._id });
      let orderId = newOrder._id,
        total = newOrder.total;
    });

    if (paymentMethod == "COD") {
      res.json({ codeSuccess: true });
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
