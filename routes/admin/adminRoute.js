const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminController')

router.get('/', controller.adminLogin);

router.get('/adminHome', controller.adminHome)

router.post('/admin', controller.signin);

router.get('/addProduct', controller.addProduct);

router.get('/showUser',controller.showUser);

router.post('/newProduct' ,controller.newProduct);

router.get('/showProducts',controller.showProducts); 

router.get('/category',controller.category);

router.get("/categoryForm",controller.categoryForm);

router.post("/categoryAdd",controller.categoryAdd);

router.get('/editCategory/:id',controller.editCategory);

router.post('/updateCategory/:id',controller.updateCategory);

router.post('/deleteCategory/:id',controller.deleteCategory);

router.post('/blockUser/:id',controller.blockUser);

router.post('/unblockUser/:id',controller.unblockUser);

router.post('/editProduct/:id',controller.editProduct);

router.post('/editProductForm/:id',controller.editProductForm)

router.post('/subCategoryAdd',controller.subCategoryAdd)

router.get('/addMainCategory',controller.addMainCategory)

router.post('/unListProduct/:id',controller.unListProduct)

router.post('/listProduct/:id',controller.listProduct)

router.route('/coupon').get(controller.coupon).post(controller.addCoupon)

router.get('/orders',controller.orders);

router.route('/banner').get(controller.banner).post(controller.addBanner)

router.post('/editBanner/:id', controller.editBanner)

router.get('/showBanner', controller.showBanner)


router.get('/showCoupon', controller.showCoupon)

router.post('/editCoupon/:id', controller.editCoupon)

router.post('/updateCoupon/:id', controller.updateCoupon)

router.post('/deleteCoupon/:id',controller.deleteCoupon)


router.post('/updateBanner/:id', controller.updateBanner)

router.post('/deleteBanner/:id',controller.deleteBanner)

router.post('/changeStatus',controller.changeStatus)

router.post('/invoice/:id' , controller.invoice)

// router.get('/invoicePage' , controller.invoicePage)

module.exports = router;