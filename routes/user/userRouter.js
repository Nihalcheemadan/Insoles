const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/userController");
const cartController = require("../../controllers/user/cartController");
const wishlistController = require("../../controllers/user/wishlistController");

router.get("/userHome", controller.userSession, controller.home);

router.get("/", controller.login);
router.get("/logout", controller.logout);
router.post("/user", controller.signin);


//order management
router.get("/checkout", controller.userSession, controller.checkout);   
router.post('/placeOrder', controller.placeOrder);
router.get('/orderSuccess',controller.orderSuccess)


router.get("/productdetail/:id", controller.showProductdetails);

router.get("/profile", controller.userSession, controller.profile);

router.get("/addAddressPage", controller.userSession, controller.addAddress);

router.post("/newAddress", controller.userSession, controller.newAddress);

router.get("/manageAddress", controller.userSession, controller.manageAddress);

router.get(
  "/deleteAddress/:id",
  controller.userSession,
  controller.deleteAddress
);

//wishlist routes

router.get("/wishlist", controller.userSession, wishlistController.wishlist);
router.get(
  "/addToWishlist/:id",
  controller.userSession,
  wishlistController.addToWishlist
);
router.get(
  "/removeWishlistProduct/:id",
  wishlistController.removeWishlistProduct
);

//cart routes

router.get("/cart", controller.userSession, cartController.cart);
router.post("/addToCart/:id", controller.userSession, cartController.addToCart);
router.get(
  "/removeProduct/:id/:total",
  controller.userSession,
  cartController.removeCartProduct
);
router.get(
  "/QtyIncrement/:id/:price",
  controller.userSession,
  cartController.QtyIncrement
);
router.get(
  "/QtyDecrement/:id/:price",
  controller.userSession,
  cartController.QtyDecrement
);

//OTP PAGE

router.post("/signup/otp", controller.sendOtp);
router.post("/resendOtp", controller.resendOtp);
router.post("/varifyOtp", controller.varifyOtp);

module.exports = router;
