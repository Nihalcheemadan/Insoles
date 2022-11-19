const bcrypt = require("bcrypt");
const signupModel = require("../../models/user/signupModel");
const addProduct = require("../../models/admin/addProduct");
const cartModel = require("../../models/user/cartModel");
const wishlistSchema = require("../../models/user/wishlistSchema");
const nodemailer = require("nodemailer");
const checkoutSchema = require("../../models/user/addressSchema");
const addressSchema = require("../../models/user/addressSchema");

var otp = Math.random();
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

var Name;
var Email;
var Phone;
var Password;

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",

  auth: {
    user: "insolesshoestore@gmail.com",
    pass: "liflarxzssptrpgo",
  },
});

module.exports = {
  //session middleware

  userSession: (req, res, next) => {
    if (req.session.userLogin) {
      next();
    } else {
      res.redirect("/login");
    }
  },

  //user home page

  home: async (req, res) => {
    const products = await addProduct.find();
    const user_name = req.session.user;
    res.render("user/userHome", { products });
  },

  // DO_SIGNUP
  sendOtp: async (req, res) => {
    Email = req.body.email;
    Name = req.body.name;
    Phone = req.body.phone;
    Password = req.body.password;
    const user = await signupModel.findOne({ email: Email });

    // send mail with defined transport object
    if (!user) {
      var mailOptions = {
        to: req.body.email,
        subject: "Otp for registration is: ",
        html:
          "<h3>OTP for account verification is </h3>" +
          "<h1 style='font-weight:bold;'>" +
          otp +
          "</h1>", // html body
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

        res.render("user/otp");
      });
    } else {
      res.redirect("/login");
    }
  },

  resendOtp: async (req,res) => {
    var mailOptions = {
      to: Email,
      subject: "Otp for registration is: ",
      html:
        "<h3>OTP for account verification is </h3>" +
        "<h1 style='font-weight:bold;'>" +
        otp +
        "</h1>", // html body
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      res.render("user/otp");
    });
  },

  varifyOtp: async (req, res) => {
    if (req.body.otp == otp) {
      const newUser = signupModel({
        name: Name,
        email: Email,
        phone: Phone,
        password: Password,
      });
      await bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(() => {
              console.log(newUser);
              req.session.user = newUser;
              res.redirect("/login");
            })
            .catch((err) => {
              console.log(err);
              res.redirect("/login"); 
            });
        });
      });
    } else {
      res.render("user/otp");  
    }
  },

  // login page

  login: (req, res) => {
    res.render("user/login");
  },

  signin: async (req, res) => {
    const { email, password } = req.body;
    const user = await signupModel.findOne({
      $and: [{ email: email }, { status: "unblocked" }],
    });
    if (!user) {
      return res.redirect("/login");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.redirect("/login");
    }
    req.session.userLogin = true;
    req.session.user = user;
    res.redirect("/login/userHome");
  },

  // single product details page

  showProductdetails: async (req, res) => {
    const id = req.params.id;
    const singleProduct = await addProduct.findById({ _id: id });
    res.render("user/productdetail", { singleProduct });
  },

  

  // logout

  logout: (req, res, next) => {
    if (req.session) {
      // delete session object
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        } else {
          return res.redirect("/login");
        }
      });
    }
  },

  // cart showing page

  cart: async (req, res) => {
    let user = req.session.user;
    let userId = user._id;
    let totalprice = 0;

    let cart = await cartModel
      .findOne({ userId: userId })
      .populate("products.productId");

    console.log(cart);

    if (cart) {
      let products = cart.products;

      console.log("cart id:" + cart);

      let cartId = cart._id;

      let cartTotal = cart.cartTotal;

      console.log(products);
      res.render("user/cart", { products, cartId, cartTotal });
    } else {
      res.render("user/cart", { products: [], cartId: null, cartTotal: 00 });
    }
  },

  // add to cart

  addToCart: async (req, res) => {
    let user = req.session.user;
    let userId = user._id;
    let productId = req.params.id;
    let product = await addProduct.findById({ _id: productId });
    let quantity = req.body.quantity;
    console.log(quantity);
    console.log(product);
    total = product.price * quantity;

    let cart = await cartModel.findOne({ userId: userId });

    if (cart) {
      // checking that product already exist in cart
      let exist = await cartModel.findOne({
        userId,
        "products.productId": productId,
      });
      if (exist != null) {
        await cartModel.findOneAndUpdate(
          { userId, "products.productId": productId },
          {
            $inc: {
              "products.$.quantity": quantity,
              "products.$.total": total,
              cartTotal: total,
            },
          }
        );
      } else {
        await cartModel.findOneAndUpdate(
          { userId },
          {
            $push: { products: { productId, quantity, total } },
            $inc: { cartTotal: total },
          }
        );
      }
    } else {
      const newCart = new cartModel({
        userId: userId,
        products: [{ productId, quantity, total }],
        cartTotal: total,
      });
      newCart.save();
    }
    res.redirect("/login/cart");
    //
  },

  //remove cart product

  removeCartProduct: async (req, res) => {
    const productId = req.params.id;
    console.log(productId);
    let user = req.session.user;
    let userId = user._id;
    console.log(userId);

    await cartModel
      .findOneAndUpdate(
        { userId: userId },
        { $pull: { products: { productId } } }
      )
      .then(() => {
        res.redirect("/login/cart");
      });
  },

  //checkout

  checkout: async (req, res) => {
    const { fname, lname, state, street, town, pincode, phone, email } =
      req.body;

    const address = addressSchema({
      fname,
      lname,
      state,
      street,
      town,
      pincode,
      phone,
      email,
    });
    await address
      .save()
      .then(() => {
        console.log(address);
        res.render("user/checkout");
      })
      .catch((err) => {
        console.log(err.message);
        console.log(err);
      });
  },

  //remove wishlist product

  removeWishlistProduct: async (req, res) => {
    const id = req.params.id;
    let user = req.session.user;
    let userId = user._id;
    await wishlistSchema
      .findOneAndUpdate({ userId }, { $pull: { productIds: id } })
      .then(() => {
        res.redirect("/login/wishlist");
      });
  },

  QtyIncrement: async (req, res) => {
    let user = req.session.user;
    let userId = user._id;
    let productId = req.params.id;
    console.log("userid" + userId, "prodid" + productId);
    let cart = await cartModel
      .findOneAndUpdate(
        { userId: userId, "products.productId": productId },
        { $inc: { "products.$.quantity": 1 } }
      )
      .then(() => {
        res.redirect("/login/cart");
      });
  },

  QtyDecrement: async (req, res) => {
    let user = req.session.user;
    let userId = user._id;
    let productId = req.params.id;

    console.log("userid" + userId, "prodid" + productId);
    let cart = await cartModel
      .findOneAndUpdate(
        { userId: userId, "products.productId": productId },
        { $inc: { "products.$.quantity": -1 } }
      )
      .then(() => {
        res.redirect("/login/cart");
      });
  },

  //wishlist page

  wishlist: (req, res) => {
    let user = req.session.user;
    let userId = user._id;
    return new Promise(async (resolve, reject) => {
      let list = await wishlistSchema
        .findOne({ userId: userId })
        .populate("productIds")
        .then((list) => {
          if (list) {
            resolve(list.productIds);
          } else {
            resolve();
          }
        });
    }).then((list) => {
      if (list) {
        res.render("user/wishlist", { login: true, list });
      } else {
        res.render("user/wishlist", { login: true, list: [] });
      }
    });
  },

  // ADD TO WISHLIST
  addToWishlist: async (req, res, next) => {
    let productId = req.params.id;
    let user = req.session.user;
    let user_id = user._id;

    let wishlist = await wishlistSchema.findOne({ userId: user_id });
    if (wishlist) {
      await wishlistSchema.findOneAndUpdate(
        { userId: user_id },
        { $addToSet: { productIds: productId } }
      );
      res.redirect("/login/wishlist");
    } else {
      const wish = new wishlistSchema({
        userId: user_id,
        productIds: [productId],
      });
      wish.save().then(() => {
        res.redirect("/login/wishlist");
      });
    }
  },
};
