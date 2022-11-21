const wishlistSchema = require("../../models/user/wishlistSchema");

module.exports = {
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
};
