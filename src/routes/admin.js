const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/isAuth');
const router = express.Router();

router.post('/admin/add-product', isAuth, adminController.postAddProduct);
router.post('/delete-product/', isAuth, adminController.postDeleteProduct);
router.post('/admin/edit-product', isAuth, adminController.postEditProduct);
router.get('/admin/edit-product', adminController.getEditProduct);

module.exports = router;
