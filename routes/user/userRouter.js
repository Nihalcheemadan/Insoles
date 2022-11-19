const express = require('express');
const router = express.Router();
const controller = require('../../controllers/user/userController');

router.get('/', controller.login);

router.get('/userHome',controller.userSession,controller.home);

// router.post('/signup' , controller.signup);

router.post('/user', controller.signin);

router.get('/logout', controller.logout)

router.get('/cart',controller.userSession,controller.cart)

router.get('/productdetail/:id',controller.showProductdetails);

router.post('/addToCart/:id',controller.userSession,controller.addToCart)

router.get('/removeProduct/:id',controller.userSession,controller.removeCartProduct)

router.get('/checkout',controller.userSession, controller.checkout)

router.get('/wishlist',controller.userSession,controller.wishlist)

router.get('/addToWishlist/:id',controller.userSession,controller.addToWishlist)

router.get('/removeWishlistProduct/:id',controller.removeWishlistProduct)

router.get('/QtyIncrement/:id',controller.userSession, controller.QtyIncrement)

router.get('/QtyDecrement/:id',controller.userSession, controller.QtyDecrement)

//OTP PAGE

router.post('/signup/otp', controller.sendOtp)
router.post('/resendOtp', controller.resendOtp)
router.post('/varifyOtp', controller.varifyOtp)

router.get('/var', controller.var)



    
module.exports = router;