const bcrypt = require("bcrypt");
const adminSignup = require("../../models/admin/adminSignup");
const addProduct = require("../../models/admin/addProduct");

const userSchema = require("../../models/user/signupModel");

const categorySchema = require("../../models/admin/categorySchema");

const signupModel = require("../../models/user/signupModel");
const subCategorySchema = require("../../models/admin/subCategorySchema");

module.exports = {
  // admin Login

  adminLogin: (req, res) => {
    res.render("admin/login");
  },

  // admin home

  adminHome: (req, res) => {
    res.render("admin/home");
  },

  //admin signup

  signup: (req, res, next) => {
    const newUser = adminSignup({
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      password: req.body.password,
    });
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser
          .save()
          .then(() => {
            console.log(newUser);
            res.redirect("/login");
          })
          .catch((err) => {
            console.log(err);
            res.redirect("/login");
          });
      });
    });
  },

  //admin signin

  signin: async (req, res, next) => {
    req.session.adminLogin = false;
    const { email, password } = req.body;
    const user = await adminSignup.findOne({ email });
    if (!user) {
      return res.redirect("/adminLogin");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.redirect("/adminLogin");
    }
    req.session.adminLogin = true;
    res.render("admin/home");
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
    let products = await addProduct.find();
    res.render("admin/showProducts", { products });
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

  // delete user

  deleteUser: async (req, res) => {
    let id = req.params.id;
    await signupModel.findByIdAndRemove({ _id: id }).then(() => {
      res.redirect("/adminLogin/showUser");
    });
  },

  //delete product

  deleteProduct: async (req, res) => {
    let id = req.params.id;
    await addProduct.findByIdAndRemove({ _id: id }).then(() => {
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
};
