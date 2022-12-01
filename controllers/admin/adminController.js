const bcrypt = require("bcrypt");
const adminSignup = require("../../models/admin/adminSignup");
const addProduct = require("../../models/admin/addProduct");

const userSchema = require("../../models/user/signupModel");

const categorySchema = require("../../models/admin/categorySchema");

const signupModel = require("../../models/user/signupModel");
const subCategorySchema = require("../../models/admin/subCategorySchema");
const couponSchema = require("../../models/admin/couponSchema");
const bannerModel = require("../../models/admin/bannerModel");
const moment = require("moment");
const orderSchema = require("../../models/user/orderSchema");


module.exports = {
  // admin Login

  adminLogin: (req, res) => {
    res.render("admin/login");
  },

  // admin home

  adminHome: (req, res) => {
    res.render("admin/home");
  },

  //admin signin

  signin: async (req, res, next) => {
    req.session.loginErr = false;
    req.session.passwordErr = false;
    let userData = req.body;

    let user = await signupModel.findOne({
      $and: [{ email: userData.email }, { type: "admin" }],
    });
    if (user) {
      bcrypt.compare(userData.password, user.password).then((status) => {
        if (status) {
          console.log("login success");

          req.session.adminLogin = true;
          res.redirect("/adminLogin/adminHome");
        } else {
          console.log("login failed! password miss match.");
          req.session.passwordErr = true;
          res.redirect("/adminLogin");
        }
      });
    } else {
      console.log("login failed, no such email");
      req.session.passwordErr = true;
      res.redirect("/adminLogin");
    }
  },

  //add product page

  addProduct: async (req, res, next) => {
    let category = await categorySchema.find();
    let subCategory = await subCategorySchema.find();
    console.log(subCategory);
    res.render("admin/addProduct", { category, subCategory });
  },

  //show user section

  showUser: async (req, res, next) => {
    let users = await userSchema.find();
    res.render("admin/showUser", { users, index: 1 });
  },

  //show product section

  showProducts: async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 5;
    const totalproducts = await addProduct.find().countDocuments();
    // console.log(totalproducts);
    const products = await addProduct
      .find({})
      .populate("category")
      .skip((page - 1) * items_per_page)
      .limit(items_per_page);
    res.render("admin/showProducts", {
      products,
      index: 1,
      page,
      hasNextPage: items_per_page * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1,
    });

    // let products = await addProduct.find();
  },

  //show categroy section

  category: async (req, res) => {
    let subCategory = await subCategorySchema.find({}).populate("category_id");

    res.render("admin/category", { subCategory });
  },

  //categroy form

  categoryForm: async (req, res) => {
    let category = await categorySchema.find();
    res.render("admin/categoryForm", { category });
  },

  //update category

  updateCategory: async (req, res) => {
    const id = req.params.id;
    const image = req.file;
    const { category, subCategory } = req.body;

    await subCategorySchema
      .updateOne(
        { _id: id },
        {
          $set: {
            category_id: category,
            subCategory: subCategory,
            imageUrl: image.path,
          },
        }
      )

      .then(() => {
        res.redirect("/adminLogin/category");
      })
      .catch((err) => {
        console.log(err);
      });
  },

  //delete category

  deleteCategory: async (req, res, next) => {
    let id = req.params.id;
    await subCategorySchema.findByIdAndRemove({ _id: id }).then(() => {
      res.redirect("/adminLogin/category");
    });
  },

  //adding new category

  categoryAdd: async (req, res) => {
    try {
      const check_cat = await categorySchema.find({
        category: req.body.category,
      });
      if (check_cat.length > 0) {
        let checking = false;
        for (let i = 0; i < check_cat.length; i++) {
          if (
            check_cat[i]["category"].toLowerCase() ===
            req.body.category.toLowerCase()
          ) {
            checking = true;
            break;
          }
        }
        if (checking === false) {
          const category = new categorySchema({
            category: req.body.category,
          });
          const sub_cat_data = await category.save().then(() => {
            res.redirect("/adminLogin/category");
          });
        } else {
          res.redirect("/adminLogin/category");
        }
      } else {
        const category = new categorySchema({
          category: req.body.category,
        });
        const sub_cat_data = await category.save().then(() => {
          res.redirect("/adminLogin/category");
        });
      }
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
    }
  },

  //add main categroy

  addMainCategory: (req, res) => {
    res.render("admin/mainCategory");
  },

  //adding sub category

  subCategoryAdd: async (req, res) => {
    try {
      const { category, subCategory } = req.body;
      const image = req.file;
      const check_sub = await subCategorySchema.find({
        category_id: category,
      });
      if (check_sub.length > 0) {
        let checking = false;
        for (let i = 0; i < check_sub.length; i++) {
          if (
            check_sub[i]["subCategory"].toLowerCase() ===
            req.body.subCategory.toLowerCase()
          ) {
            checking = true;
            break;
          }
        }
        if (checking === false) {
          const subCategory = new subCategorySchema({
            category_id: category,
            subCategory: req.body.subCategory,
            imageUrl: image.path,
          });
          const sub_cat_data = await subCategory.save().then(() => {
            res.redirect("/adminLogin/category");
          });
        } else {
          res.redirect("/adminLogin/category");
        }
      } else {
        const subCategory = new subCategorySchema({
          category_id: category,
          subCategory: req.body.subCategory,
          imageUrl: image.path,
        });
        const sub_cat_data = await subCategory.save().then(() => {
          res.redirect("/adminLogin/category");
        });
      }
    } catch (error) {
      res.status(400).send({ success: false, msg: error.message });
    }
  },

  //edit category form

  editCategory: async (req, res, next) => {
    const id = req.params.id;
    const imageUrl = req.file;
    console.log(imageUrl);
    let category = await categorySchema.find();
    const singleCategory = await subCategorySchema
      .findOne({ _id: id })
      .populate("category_id");

    res.render("admin/editCategory", { singleCategory, category });
  },

  // adding new product

  newProduct: async (req, res, next) => {
    const { category, subCategory, name, brand, description, price } = req.body;
    const image = req.file;

    console.log(image);
    const newProduct = addProduct({
      category,
      subCategory,
      name,
      brand,
      description,
      price,
      image: image.path,
    });
    await newProduct
      .save()
      .then(() => {
        console.log(newProduct);
        res.redirect("/adminLogin/addProduct");
      })
      .catch((err) => {
        console.log(err.message);
        console.log(err);
      });
  },

  // block a user

  blockUser: async (req, res) => {
    let id = req.params.id;
    await signupModel
      .findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            status: "blocked",
          },
        }
      )
      .then(() => {
        res.redirect("/adminLogin/showUser");
      });
  },

  //unblock a user

  unblockUser: async (req, res) => {
    let id = req.params.id;
    await signupModel
      .findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            status: "unblocked",
          },
        }
      )
      .then(() => {
        res.redirect("/adminLogin/showUser");
      });
  },

  //list product

  listProduct: async (req, res) => {
    let id = req.params.id;
    await addProduct
      .findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            status: "listed",
          },
        }
      )
      .then(() => {
        res.redirect("/adminLogin/showProducts");
      });
  },

  //unlist product

  unListProduct: async (req, res) => {
    let id = req.params.id;
    await addProduct
      .findByIdAndUpdate(
        { _id: id },
        {
          $set: {
            status: "unlisted",
          },
        }
      )
      .then(() => {
        res.redirect("/adminLogin/showProducts");
      });
  },

  //edit product page

  editProductForm: async (req, res) => {
    const id = req.params.id;

    const singleProduct = await addProduct.findOne({ _id: id });
    let category = await categorySchema.find();
    let subCategory = await subCategorySchema.find();
    res.render("admin/editProductForm", {
      singleProduct,
      category,
      subCategory,
    });
  },

  // update product

  editProduct: async (req, res) => {
    const id = req.params.id;
    const image = req.file;

    const { category, subCategory, name, brand, description, price } = req.body;

    await addProduct
      .updateOne(
        { _id: id },
        {
          $set: {
            category,
            subCategory,
            name,
            brand,
            description,
            price,
            image: image.path,
          },
        }
      )

      .then(() => {
        res.redirect("/adminLogin/showProducts");
      })
      .catch((err) => {
        console.log(err);
      });
  },
  coupon: (req, res) => {
    res.render("admin/couponManagement");
  },
  addCoupon: async (req, res) => {
    const coupon = req.body;
    await new couponSchema(coupon).save().then(() => {
      res.redirect("/adminLogin/coupon");
    });
  },
  orders: async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 8;
    const totalproducts = await orderSchema.find().countDocuments();
    const orders = await orderSchema
      .find({})
      .populate("products.productId")
      .populate("userId")
      .sort({ date: -1 })
      .skip((page - 1) * items_per_page)
      .limit(items_per_page);

    res.render("admin/orders", {
      orders,
      moment,
      index: 1,
      page,
      hasNextPage: items_per_page * page < totalproducts,
      hasPreviousPage: page > 1,
      PreviousPage: page - 1,
    });
  },

  // invoicePage:(req,res)=>{
    
  
  //   res.render('admin/invoice')
  // },

  invoice:async(req,res)=>{

    
    let orderId =  req.params.id
    console.log(orderId);

    let order = await orderSchema.findOne({_id:orderId}).populate('products.productId').populate('userId').populate('address')
  
    
    const products = order.products
    const address = order.address;
    res.render('admin/invoice',{order, address, products , moment})
    // res.render('admin/invoice2',{order, address, products , moment})

  },

  changeStatus: async (req, res) => {
    const { status, orderId, productId } = req.body;
    if (status == "Order Placed") {
      await orderSchema.updateOne(
        { _id: orderId, "products.productId": productId },
        { $set: { "products.$.orderStatus": "Packed" } }
      );
    } else if (status == "Packed") {
      await orderSchema.updateOne(
        { _id: orderId, "products.productId": productId },
        { $set: { "products.$.orderStatus": "Shipped" } }
      );
    } else if (status == "Shipped") {
      await orderSchema.updateOne(
        { _id: orderId, "products.productId": productId },
        {
          $set: {
            "products.$.orderStatus": "Delivered",
            "products.$.paymentStatus": "Paid",
          },
        },
        { multi: true }
      );
    } else {
      await orderSchema.updateOne(
        { _id: orderId, "products.productId": productId },
        {
          $set: {
            "products.$.orderStatus": "Cancelled",
            "products.$.paymentStatus": "Unpaid",
          },
        },
        { multi: true }
      );
    }
    res.json({ success: "success" });
  },

  banner: (req, res) => {
    res.render("admin/banner");
  },
  addBanner: async (req, res) => {
    const { title, description } = req.body;
    const image = req.file;

    await new bannerModel({
      title,
      description,
      image: image.path,
    })
      .save()
      .then(() => {
        res.redirect("/adminLogin/banner");
      });
  },

  showBanner: async (req, res) => {
    let banner = await bannerModel.find();
    res.render("admin/showBanner", { banner });
  },

  editBanner: async (req, res) => {
    let bannerId = req.params.id;
    let banner = await bannerModel.findById({ _id: bannerId });
    res.render("admin/editBanner", { banner });
  },

  updateBanner: async (req, res) => {
    const id = req.params.id;
    const { title, description } = req.body;
    const image = req.file;
    const banner = await bannerModel.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          title,
          description,

          image: image.path,
        },
      }
    );
    banner.save().then(() => {
      res.redirect("/adminLogin/showBanner");
    });
  },

  deleteBanner: async (req, res) => {
    const id = req.params.id;
    await bannerModel.findByIdAndDelete({ _id: id }).then(() => {
      res.redirect("/adminLogin/showBanner");
    });
  },
};
