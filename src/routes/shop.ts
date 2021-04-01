import express from 'express';
import { body, query } from 'express-validator';

import * as shopController from '../controllers/shop';

const router = express.Router();

router.get('/home', shopController.getHome);
router.get('/products', shopController.getProducts);
router.get('/products/:prodId', shopController.getProduct);
router.post('/cart', shopController.postCart);
router.post(
  '/order',
  [
    body('orderData.firstName', 'First name must be between 2 and 20 characters')
      .trim()
      .isAlphanumeric()
      .isLength({ max: 20, min: 2 }),
    body('orderData.lastName', 'Last name must be between 2 and 20 characters')
      .trim()
      .isAlphanumeric()
      .isLength({ max: 20, min: 2 }),
    body('orderData.streetAddress', 'Street address must be between 2 and 50 characters')
      .trim()
      .isLength({ max: 50, min: 2 }),
    body(
      'orderData.streetAddress2',
      'Street address 2 must be between 2 and 20 characters'
    )
      .trim()
      .isLength({ max: 50, min: 2 })
      .optional(),
    body('orderData.city', 'City must be between 2 and 50 characters')
      .trim()
      .isAlphanumeric()
      .isLength({ max: 50, min: 2 }),
    body('orderData.postalCode', 'Invalid postal code format')
      .trim()
      .isAlphanumeric()
      .matches(/^([A-Za-z][0-9][A-Za-z])([0-9][A-Za-z][0-9])$/),
    body('orderData.phoneNumber', 'Invalid phone number format')
      .trim()
      .isAlphanumeric()
      .matches(/^\d{10}$/)
  ],
  shopController.postOrder
);
router.post('/create-payment-intent', shopController.postSecret);
router.get('/orders', shopController.getOrders);
router.get('/search', [query('value').trim().isAlphanumeric()], shopController.getSearch);

export default router;
