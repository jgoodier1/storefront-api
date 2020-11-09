const express = require('express');

const shopController = require('../controllers/shop');

const router = express.Router();

router.get('/products', shopController.getProducts);
router.get('/products/:prodId', shopController.getProduct);
// router.get('/cart', shopController.getCart);
router.post('/cart', shopController.postCart);
router.post('/cart-delete', shopController.postCartDelete);
router.post('/order', shopController.postOrder);
router.post('/orders', shopController.postOrders);

module.exports = router;
