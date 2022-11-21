const bcrypt = require("bcrypt");
const signupModel = require("../../models/user/signupModel");
const addProduct = require("../../models/admin/addProduct");
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

  resendOtp: async (req, res) => {
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

  

  
};
