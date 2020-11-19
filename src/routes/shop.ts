import express from 'express';

import * as shopController from '../controllers/shop';

const router = express.Router();

router.get('/products', shopController.getProducts);
router.get('/products/:prodId', shopController.getProduct);
router.post('/cart', shopController.postCart);
// router.post('/cart-delete', shopController.postCartDelete);
router.post('/order', shopController.postOrder);
router.post('/orders', shopController.postOrders);
// VALIDATE INPUT
router.get('/search', shopController.getSearch);

export default router;
