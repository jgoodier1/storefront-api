import express from 'express';
import { body } from 'express-validator';

import User from '../models/user';
import * as authController from '../controllers/auth';

const router = express.Router();

router.post(
  '/signup',
  [
    body('name').isAlphanumeric().withMessage('Name must be alphanumeric').trim(),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(value => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('Email already exists');
          }
        });
      })
      .normalizeEmail(),
    body('password', 'Password must be alphanumeric and at least 5 characters')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords have to match');
        }
        return true;
      })
      .trim()
  ],
  authController.postSignUp
);

router.post(
  '/signin',
  [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password', 'Password must be alphanumeric and at least 5 characters')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postSignIn
);

// router.post('/logout', authController.postLogout);

export default router;
