// NOT USING THIS

import express from 'express';

import * as adminController from '../controllers/admin';
import isAuth from '../middleware/isAuth';

const router = express.Router();

router.post('/admin/add-product', isAuth, adminController.postAddProduct);
router.post('/delete-product/', isAuth, adminController.postDeleteProduct);
router.post('/admin/edit-product', isAuth, adminController.postEditProduct);
router.get('/admin/edit-product', adminController.getEditProduct);

export default router;
