const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/adminController')

router.get('/', controller.adminLogin);

router.post('/signup' , controller.signup);

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

module.exports = router;