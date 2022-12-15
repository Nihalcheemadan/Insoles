const bcrypt = require("bcrypt");
const addProduct = require("../../models/admin/addProduct");
const categorySchema = require("../../models/admin/categorySchema");
const signupModel = require("../../models/user/signupModel");
const subCategorySchema = require("../../models/admin/subCategorySchema");
const couponSchema = require("../../models/admin/couponSchema");
const bannerModel = require("../../models/admin/bannerModel");
const moment = require("moment");
const orderSchema = require("../../models/user/orderSchema");
const brandSchema = require("../../models/admin/brand");


module.exports = {
  // admin Login

  adminLogin: (req, res) => {
    res.render("admin/login");
  },

  logout: (req, res, next) => {
    if (req.session) {
      // delete session object
      req.session.destroy((err) => {
        if (err) {
          return next(err);
        } else {
          return res.redirect("/admin");
        }
      });
    }
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
          res.redirect("/admin/adminHome");
        } else {
          console.log("login failed! password miss match.");
          req.session.passwordErr = true;
          res.redirect("/admin");
        }
      });
    } else {
      console.log("login failed, no such email");
      req.session.passwordErr = true;
      res.redirect("/admin");
    }
  },

  //admin session

  adminSession: async (req, res, next) => {
    if (req.session.adminLogin) {
      next();
    } else {
      res.redirect("/admin");
    }
  },

  // admin home

  adminHome: async (req, res) => {
    try{

    
    let userCount = await signupModel.find({}).countDocuments()
    let productCount = await addProduct.find({}).countDocuments()
    let sales = await orderSchema.aggregate([
      {
        "$group":{
          '_id':null,
          'totalSales':{
            "$sum":"$total"
          }
        }
    }])

    let onlinePayments = await orderSchema.aggregate([
      {
        "$match":{
          paymentMethod:"Razorpay"
        }
      },
      {
        "$group":{
          "_id":null,
          'totalOnlineSales':{
            "$sum":"$total"
          }
        }
      }
    ])

    let offlinePayments = await orderSchema.aggregate([
      {
        "$match":{ 
          paymentMethod:"COD"
        }
      },
      {
        "$group":{
          "_id":null,
          'totalOfflineSales':{
            "$sum":"$total"
          }
        }
      }
    ])

    let totalSales = sales.map(a=> a.totalSales)
    let totalOnlineSales = onlinePayments.map(a=> a.totalOnlineSales)
    let offlinePay = offlinePayments.map(a=> a.totalOfflineSales)
    
    res.render("admin/home", {userCount,productCount, totalSales , totalOnlineSales ,offlinePay });
    }catch{
    
      res.render('error')
    }
  },

  //add product page

  addProduct: async (req, res, next) => {
    
    let category = await categorySchema.find().populate("category");
    let subCategory = await subCategorySchema.find();
    let brand = await brandSchema.find();
    console.log(brand);
    res.render("admin/addProduct", { category, subCategory, brand });
  },

  // adding new product

  newProduct: async (req, res, next) => {
    try{
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
        res.redirect("/admin/addProduct");
      })
    }catch{
      res.render('error')
    }
  },

  //show product section

  showProducts: async (req, res, next) => {
    try{
    const page = parseInt(req.query.page) || 1;
    const items_per_page = 5;
    const totalproducts = await addProduct.find().countDocuments();
    // console.log(totalproducts);
    const products = await addProduct
      .find({})
      .populate("category")
      .populate("brand")
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
  }catch{
    res.render('error')
  }

    // let products = await addProduct.find();
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
        res.redirect("/admin/showProducts");
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
        res.redirect("/admin/showProducts");
      });
  },

  //edit product page

  editProductForm: async (req, res) => {
    try{
    const id = req.params.id;

    const singleProduct = await addProduct.findOne({ _id: id });
    let category = await categorySchema.find();
    let subCategory = await subCategorySchema.find();
    let brand = await brandSchema.find();
    res.render("admin/editProductForm", {
      singleProduct,
      category,
      subCategory,
      brand
    });
  }catch{
    res.render('error')
  }
  },

  // update product

  editProduct: async (req, res) => {
    try{
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
        res.redirect("/admin/showProducts");
      })
     
    }catch{
      res.render('error')
    }
  },

  //show categroy section

  category: async (req, res) => {
    let subCategory = await subCategorySchema.find({}).populate("category_id");

    res.render("admin/category", { subCategory });
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
            res.redirect("/admin/category");
          });
        } else {
          res.redirect("/admin/category");
        }
      } else {
        const category = new categorySchema({
          category: req.body.category,
        });
        const sub_cat_data = await category.save().then(() => {
          res.redirect("/admin/category");
        });
      }
    } catch (error) {
      res.render('error');
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
            res.redirect("/admin/category");
          });
        } else {
          res.redirect("/admin/category");
        }
      } else {
        const subCategory = new subCategorySchema({
          category_id: category,
          subCategory: req.body.subCategory,
          imageUrl: image.path,
        });
        const sub_cat_data = await subCategory.save().then(() => {
          res.redirect("/admin/category");
        });
      }
    } catch (error) {
      res.render('error');
    }
  },

  //edit category form

  editCategory: async (req, res, next) => {
    try{
    const id = req.params.id;
    const imageUrl = req.file;
    console.log(imageUrl);
    let category = await categorySchema.find();
    const singleCategory = await subCategorySchema
      .findOne({ _id: id })
      .populate("category_id");

    res.render("admin/editCategory", { singleCategory, category });
    }catch{
      res.render('error')
    }
  },

  //categroy form

  categoryForm: async (req, res) => {
    let category = await categorySchema.find();
    res.render("admin/categoryForm", { category });
  },

  //update category

  updateCategory: async (req, res) => {
    try{
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
        res.redirect("/admin/category");
      })
      .catch((err) => {
        console.log(err);
      });
    }catch{
      res.render('error')
    }
  },

  //delete category

  deleteCategory: async (req, res, next) => {
    let id = req.params.id;
    await subCategorySchema.findByIdAndRemove({ _id: id }).then(() => {
      res.redirect("/admin/category");
    });
  },

  //brands
  brand: (req, res) => {
    res.render("admin/brand");
  },

  //add a new brand
  addBrand: async (req, res) => {
    const brand = req.body;
    await new brandSchema(brand).save().then(() => {
      res.redirect("/admin/brand");
    });
  },

  //show user section

  showUser: async (req, res, next) => {
    let users = await signupModel.find();
    res.render("admin/showUser", { users, index: 1 });
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
        res.redirect("/admin/showUser");
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
        res.redirect("/admin/showUser");
      });
  },

  //coupon management

  coupon: (req, res) => {
    res.render("admin/couponManagement");
  },

  //show coupons page

  showCoupon: async (req, res) => {
    let coupon = await couponSchema.find();
    res.render("admin/showCoupon", { coupon });
  },

  // add new coupon

  addCoupon: async (req, res) => {

    const coupon = req.body;
    await new couponSchema(coupon).save().then(() => {
      res.redirect("/admin/coupon");
    });
  },

  //delete coupon

  deleteCoupon: async (req, res) => {
    const id = req.params.id;
    await couponSchema.findByIdAndDelete({ _id: id }).then(() => {
      res.redirect("/admin/showCoupon");
    });
  },

  //update coupon

  updateCoupon: async (req, res) => {
    try{
    const id = req.params.id;
    const { name, code, discount } = req.body;

    const coupon = await couponSchema.findByIdAndUpdate(
      { _id: id },
      {
        $set: {
          name,
          code,
          discount,
        },
      }
    );
    coupon.save().then(() => {
      res.redirect("/admin/showCoupon");
    });
  }catch{
    res.render('error')
  }
  },

  //edit coupon

  editCoupon: async (req, res) => {
    try{
    let couponId = req.params.id;
    let coupon = await couponSchema.findById({ _id: couponId });
    res.render("admin/editCoupon", { coupon });
    }catch{
      res.render('error')
    }
  },

  //orders page

  orders: async (req, res) => {
    try{
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
  }catch{
    res.render('error')
  }
  },

  //invoice

  invoice: async (req, res) => {
    try{

    
    let orderId = req.params.id;
    let productId = req.params.productId;
    

    let order = await orderSchema
      .findOne({ _id: orderId })
      .populate("products.productId")
      .populate("userId")
      .populate("address");

    const products = order.products;
    const address = order.address;
    res.render("admin/invoice", { order, address, products, moment });
    }catch{
      console.log("catchhhhh");
      res.render('error');
    }
  },

  //change order status in order management

  changeStatus: async (req, res) => {
    try{

    
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
  }catch{
    res.render(error)
  }
  },

  //add banner page

  banner: (req, res) => {
    res.render("admin/banner");
  },

  // add new banner

  addBanner: async (req, res) => {
    try{

    
    const { title, description } = req.body;
    const image = req.file;

    await new bannerModel({
      title,
      description,
      image: image.path,
    })
      .save()
      .then(() => {
        res.redirect("/admin/banner");
      });
    }catch{
      res.render('error')
    }
  },

  //show banner

  showBanner: async (req, res) => {
    let banner = await bannerModel.find();
    res.render("admin/showBanner", { banner });
  },

  //edit banner

  editBanner: async (req, res) => {
    try{
    let bannerId = req.params.id;
    let banner = await bannerModel.findById({ _id: bannerId });
    res.render("admin/editBanner", { banner });
    }catch{
      res.render('error')
    }
  },

  //update edited banner

  updateBanner: async (req, res) => {
    try{
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
      res.redirect("/admin/showBanner");
    });
  }catch{
    res.render('error')
  }
  },

  //delete banner

  deleteBanner: async (req, res) => {
    const id = req.params.id;
    await bannerModel.findByIdAndDelete({ _id: id }).then(() => {
      res.redirect("/admin/showBanner");
    });
  },
};
