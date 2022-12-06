const express = require("express");
const router = express.Router();
const controller = require("../../controllers/user/userController");
const cartController = require("../../controllers/user/cartController");
const wishlistController = require("../../controllers/user/wishlistController");
const orderController = require('../../controllers/user/orderController')


router.get("/", controller.userHome);


router.get("/login", controller.login);
router.get("/logout", controller.logout);
router.post("/user", controller.signin);
router.get("/productdetail/:id", controller.showProductdetails);
router.get("/shop",controller.shop)
router.route("/contact").get (controller.contact).post(controller.contactMessage)
router.get("/about", controller.about)

//user profile and address management

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
router.post("/addToWishlist",controller.userSession,wishlistController.addToWishlist);
router.get("/removeWishlistProduct/:id",wishlistController.removeWishlistProduct);
router.get('/moveToCart/:id', controller.userSession , wishlistController.moveToCart)

//cart routes                   

router.get("/cart", controller.userSession, cartController.cart);
router.post("/addToCart/:id", controller.userSession, cartController.addToCart);
router.get("/removeProduct/:id/:total",controller.userSession,cartController.removeCartProduct);
router.post("/QtyIncrement",controller.userSession,cartController.QtyIncrement);
router.post("/QtyDecrement",controller.userSession,cartController.QtyDecrement);


//OTP PAGE

router.post("/signup/otp", controller.sendOtp);
router.post("/resendOtp", controller.resendOtp);
router.post("/varifyOtp", controller.varifyOtp);


//order management
router.post("/changeAddress", orderController.checkout);   
router.get('/checkout',controller.userSession, orderController.checkout)
router.post('/placeOrder', orderController.placeOrder);
router.get('/orderSuccess',controller.userSession , orderController.orderSuccess)
router.post('/checkoutNewAddress',orderController.checkoutNewAddress)
router.post('/verifyPayment' , controller.userSession  ,orderController.verifyPayment)
router.get('/orders',controller.userSession, orderController.orders)
router.post('/cancelOrder',controller.userSession,orderController.cancelOrder)

router.post('/checkCoupen' , cartController.checkCoupen)


module.exports = router;