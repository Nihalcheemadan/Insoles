const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminController')

router.get('/', controller.adminLogin);
router.post('/admin', controller.signin);
router.get("/logout", controller.logout);
router.get('/adminHome', controller.adminSession, controller.adminHome)

//Product Management
router.get('/addProduct',controller.adminSession, controller.addProduct);
router.get('/showProducts',controller.adminSession,controller.showProducts); 
router.post('/newProduct',controller.newProduct);
router.post('/unListProduct/:id',controller.unListProduct)
router.post('/listProduct/:id',controller.listProduct)
router.post('/editProduct/:id',controller.editProduct);
router.post('/editProductForm/:id',controller.editProductForm)
router.route('/brand').get(controller.brand).post(controller.addBrand)

//Category Management
router.get('/category',controller.adminSession,controller.category);
router.post("/categoryAdd",controller.categoryAdd);
router.get("/categoryForm",controller.adminSession,controller.categoryForm);
router.post('/deleteCategory/:id',controller.deleteCategory);
router.post('/updateCategory/:id',controller.updateCategory);
router.get('/editCategory/:id',controller.adminSession,controller.editCategory);
router.post('/subCategoryAdd',controller.subCategoryAdd)
router.get('/addMainCategory',controller.adminSession,controller.addMainCategory)

//User Management
router.post('/blockUser/:id',controller.blockUser);
router.get('/showUser',controller.adminSession, controller.showUser);
router.post('/unblockUser/:id',controller.unblockUser);

//coupon management
router.route('/coupon').get(controller.adminSession,controller.coupon).post(controller.addCoupon)
router.post('/deleteCoupon/:id',controller.deleteCoupon)
router.post('/updateCoupon/:id', controller.updateCoupon)
router.post('/editCoupon/:id', controller.editCoupon)
router.get('/showCoupon',controller.adminSession, controller.showCoupon)

//banner management
router.post('/deleteBanner/:id',controller.deleteBanner)
router.post('/updateBanner/:id', controller.updateBanner)
router.route('/banner').get(controller.adminSession,controller.banner).post(controller.addBanner)
router.get('/showBanner',controller.adminSession, controller.showBanner)
router.post('/editBanner/:id', controller.editBanner)

//order management
router.get('/orders',controller.adminSession,controller.orders);
router.post('/invoice/:id/:productId' , controller.invoice)
router.post('/changeStatus',controller.changeStatus)

module.exports = router;