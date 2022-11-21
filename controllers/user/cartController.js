const addProduct = require("../../models/admin/addProduct");
const cartModel = require("../../models/user/cartModel");

module.exports = {
  // cart showing page

  cart: async (req, res) => {
    let userId = req.session.user._id;

    let cart = await cartModel
      .findOne({ userId: userId })
      .populate("products.productId");

    console.log(cart);

    if (cart) {
      let products = cart.products;

      let cartTotal = cart.cartTotal;

      res.render("user/cart", { products, cartTotal });
    } else {
      res.render("user/cart", { products: [] });
    }
  },

  // add to cart

  addToCart: async (req, res) => {
    let user = req.session.user;
    let userId = user._id;
    let productId = req.params.id;
    let product = await addProduct.findById({ _id: productId });
    let quantity = req.body.quantity;

    let total = product.price * quantity;

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
              "products.$.quantity": 1,
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
    let userId = req.session.user._id;
    let total = parseInt(req.params.total);
    console.log(total);

    let product = addProduct.findById(productId);

    await cartModel
      .findOneAndUpdate(
        { userId: userId },
        {
          $pull: { products: { productId } },
          $inc: {
            cartTotal: -total,
          },
        }
      )
      .then(() => {
        res.redirect("/login/cart");
      });
  },

  //cart quantity increment

  QtyIncrement: async (req, res) => {
    let userId = req.session.user._id;

    let productId = req.params.id;
    let price = parseInt(req.params.price);

    let product = await addProduct.findById(productId);

    let cart = await cartModel
      .findOneAndUpdate(
        { userId: userId, "products.productId": productId },
        {
          $inc: {
            "products.$.quantity": 1,
            "products.$.total": price,
            cartTotal: product.price,
          },
        }
      )
      .then(() => {
        res.redirect("/login/cart");
      });
  },

  //cart quantity decrement

  QtyDecrement: async (req, res) => {
    let userId = req.session.user._id;

    let productId = req.params.id;
    let price = parseInt(req.params.price);

    let product = await addProduct.findById(productId);

    let cart = await cartModel
      .findOneAndUpdate(
        { userId: userId, "products.productId": productId },
        {
          $inc: {
            "products.$.quantity": -1,
            "products.$.total": -price,
            cartTotal: -product.price,
          },
        }
      )
      .then(() => {
        res.redirect("/login/cart");
      });
  },
};
