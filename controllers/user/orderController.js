module.exports = {
  // Place Order
  checkout: async (req, res) => {
    let index = Number(req.body.index);
    if (!index) {
      index = 0;
    }
    const userId = req.session.userId;
    const addresses = await addressModel.findOne({ user: userId });
    let address;
    if (addresses) {
      address = addresses.address;
    } else {
      address = [];
    }
    const cartItems = await cartModel.findOne({ owner: userId });
    if (cartItems) {
      res.render("user/checkout", {
        login: req.session.login,
        address,
        index,
        cartItems,
      });
    } else {
      res.redirect("/login");
    }
  },

  // Oreder Conform
  orderConfirm: async (req, res) => {
    console.log(req.body);
    const paymentMethod = req.body.paymentMethod;
    const userId = req.session.userId;
    const indexof = parseInt(req.body.index);
    const addresses = await addressModel.findOne({ user: userId });
    const address = addresses.address[indexof];
    const cart = await cartModel.findOne({ owner: userId });
    const products = cart.items;
    const grandTotal = cart.cartTotal;
    const addOrder = await orderModel({
      userId,
      products,
      address,
      grandTotal,
      paymentMethod,
    });
    addOrder.save();
    // await cartModel.findOneAndDelete({ owner: userId })
    if (paymentMethod === "COD") {
      res.json({ payment: "COD" });
      // res.render('user/order-success', { login: req.session.login })
    } else {
      var instance = new Razorpay({
        key_id: "rzp_test_ot382G21y8f1J7",
        key_secret: "QegvCVlutW7TdMqKKFVLQt1I",
      });
      const options = {
        amount: addOrder.grandTotal * 100,
        currency: "INR",
        reciept: "" + addOrder._id,
      };
      instance.orders.create(options, (err, order) => {
        if (err) {
          console.log(err);
        } else {
          console.log("new order", order);
          res.json(order);
        }
      });
    }
  },

  //Orders View
  orderView: async (req, res) => {
    const userName = req.session.userName;
    const userId = req.session.userId;

    const Orders = await orderModel
      .find({ userId: userId })
      .populate("products.product")
      .exec((err, allOrders) => {
        if (err) {
          console.log(err);
        }

        res.render("user/view-order", { userName, allOrders });
      });
  },

  //payment verification
  paymentVerification: (req, res) => {
    console.log(req.body);
    const crypto = require("crypto");
    let hmac = crypto.createHmac("sha256", "QegvCVlutW7TdMqKKFVLQt1I");
    console.log(req.body.order.data.id);
    hmac.update(
      req.body.payment.razorpay_order_id +
        "|" +
        req.body.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");
    if (hmac == req.body.payment.razorpay_signature) {
      response = { valid: "true" };
      res.json(response);
    }
  },
};
