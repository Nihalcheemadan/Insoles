const bcrypt = require("bcrypt");
const signupModel = require("../../models/user/signupModel");
const addProduct = require("../../models/admin/addProduct");
const nodemailer = require("nodemailer");
const addressSchema = require("../../models/user/addressSchema");
const bannerModel = require("../../models/admin/bannerModel");
const contactSchema = require("../../models/user/contactSchema");
const categorySchema = require("../../models/admin/categorySchema");
const brandSchema = require("../../models/admin/brand");

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

  userSession: async (req, res, next) => {
    try {
      userId = req.session.user._id;

      let user = await signupModel.findById({ _id: userId });
      if (req.session.userLogin && user.status === "unblocked") {
        next();
      } else {
        res.redirect("/login");
      }
    } catch {
      res.render("error");
    }
  },

  //user home page

  userHome: async (req, res) => {
    if (req.session.userLogin) {
      const products = await addProduct
        .find({})
        .populate("brand")
        .sort({ date: -1 })
        .limit(12);
      const banner = await bannerModel.find();

      res.render("user/userHome", { products, banner });
    } else {
      const products = await addProduct
        .find()
        .populate("brand")
        .sort({ date: -1 })
        .limit(12);
      const banner = await bannerModel.find();

      res.render("user/home", { products, banner });
    }
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
    res.redirect("/");
  },

  // single product details page

  showProductdetails: async (req, res) => {
    const id = req.params.id;
    const singleProduct = await addProduct.findById({ _id: id });
    res.render("user/productdetail", { singleProduct });
  },

  shop: async (req, res) => {
    const category = req.query.category;
    const brand = req.query.brand;
    const sort = req.query.sort;

    const page = parseInt(req.query.page) || 1;
    const items_per_page = 10;
    const totalproducts = await addProduct.find().countDocuments();
    const mainCategory = await categorySchema.find({});
    const brands = await brandSchema.find({});

    if (category) {
      let product = await addProduct
        .find({ category: category })
        .populate("category")
        .sort({ date: -1 })
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);

      res.render("user/shop", {
        product,
        mainCategory,
        brands,
        items_per_page,
        totalproducts,
        page,
        hasNextPage: items_per_page * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
    } else if (brand) {
      let product = await addProduct
        .find({ brand: brand })
        .populate("brand")
        .sort({ date: -1 })
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);

      res.render("user/shop", {
        product,
        brands,
        mainCategory,
        items_per_page,
        totalproducts,
        page,
        hasNextPage: items_per_page * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
    }else if(sort=='ascending'){
      let product = await addProduct
        .find({})
        
        .sort({ price: 1 })
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);

      res.render("user/shop", {
        product,
        brands,
        mainCategory,
        items_per_page,
        totalproducts,
        page,
        hasNextPage: items_per_page * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
    }else if(sort=='descending'){
      let product = await addProduct
        .find({})
        
        .sort({ price: -1 })
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);

      res.render("user/shop", {
        product,
        brands,
        mainCategory,
        items_per_page,
        totalproducts,
        page,
        hasNextPage: items_per_page * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
    }
    else if(sort=='new'){
      let product = await addProduct
        .find({})
        
        .sort({ dare: -1 })
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);

      res.render("user/shop", {
        product,
        brands,
        mainCategory,
        items_per_page,
        totalproducts,
        page,
        hasNextPage: items_per_page * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
    }
     else {
      let product = await addProduct
        .find({})
        .sort({ date: -1 })
        .skip((page - 1) * items_per_page)
        .limit(items_per_page);
      res.render("user/shop", {
        product,
        mainCategory,
        brands,
        items_per_page,
        totalproducts,
        page,
        hasNextPage: items_per_page * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
      });
    }
  },

  


  contact: (req, res) => {
    res.render("user/contact");
  },

  contactMessage: async (req, res) => {
    const contact = req.body;
    await new contactSchema(contact).save().then(() => {
      res.redirect("/contact");
    });
  },

  about: (req, res) => {
    res.render("user/about");
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

  //profile page

  profile: async (req, res) => {
    let userId = req.session.user._id;

    let address = await addressSchema.findOne({ userId });
    let user = req.session.user;

    if (address != null) {
      if (address.address.length > 0) {
        let num = address.address.length - 1;
        address = address.address[num];
      } else address = [];
    } else {
      address = [];
    }
    res.render("user/profile", { address, user });
  },

  // add address

  addAddress: async (req, res) => {
    res.render("user/addAddress");
  },

  manageAddress: async (req, res) => {
    let userId = req.session.user._id;

    let address = await addressSchema.findOne({ userId: userId });

    if (address != null) {
      if (address.address.length > 0) {
        address = address.address;
      } else address = [];
    } else {
      address = [];
    }

    res.render("user/manageAddress", { address, index: 1 });
  },

  deleteAddress: async (req, res) => {
    let userId = req.session.user._id;
    let addressId = req.params.id;

    let address = await addressSchema
      .findOneAndUpdate(
        { userId: userId },
        { $pull: { address: { _id: addressId } } }
      )
      .then(() => {
        res.redirect("/manageAddress");
      });
  },

  newAddress: async (req, res) => {
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
          res.redirect("/manageAddress");
        });
    } else {
      const address = new addressSchema({
        userId,
        address: [{ fullName, houseName, city, state, pincode, phone }],
      });
      await address
        .save()
        .then(() => {
          res.redirect("/manageAddress");
        })
        .catch((err) => {
          console.log(err.message);
        });
    }
  },
};
