import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import User from '../models/user';
import { HttpStatusCode, NewError } from '../error';

// eslint-disable-next-line
export const postSignUp = (req: Request, res: Response, next: NextFunction): any => {
  const { email, password, name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  const salt = bcrypt.genSaltSync(10);
  bcrypt
    .hash(password, salt)
    .then(hashedPassword => {
      const user = new User(name, email, hashedPassword);
      return user.save();
    })
    .then(() => {
      res.status(200).json('signup complete');
    })
    .catch(err => {
      const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
      return next(error);
    });
};

export const postSignIn = async (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line
): Promise<any> => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const user = await User.findByEmail(email);
    if (!user) {
      // return as array because that's what frontend already expects for other errors
      res.status(422).json([{ msg: 'Invalid email or password' }]);
    } else {
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch && process.env.JWT !== undefined) {
            const token = jwt.sign(
              { email, userId: user._id.toString() },
              process.env.JWT,
              { expiresIn: '1hr' }
            );
            res.json({ token: token, userId: user._id.toString() });
          } else {
            // return as array because that's what frontend already expects for other errors
            return res.status(422).json([{ msg: 'Invalid email or password' }]);
          }
        })
        .catch(err => {
          const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER); //???
          return next(error);
        });
    }
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};
