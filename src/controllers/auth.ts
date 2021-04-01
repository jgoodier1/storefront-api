import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from 'express';

import User from '../models/user';
import { HttpStatusCode, NewError } from '../error';

export const postSignUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  const { email, password, name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  const salt = bcrypt.genSaltSync(10);
  bcrypt
    .hash(password, salt)
    .then(async hashedPassword => {
      const user = new User(name, email, hashedPassword);
      await user.save();
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
): Promise<void | Response> => {
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
        .compare(password, user.pass_hash)
        .then(doMatch => {
          if (doMatch && process.env.JWT !== undefined) {
            const token = jwt.sign(
              { email, userId: user.user_id.toString() },
              process.env.JWT
              // { expiresIn: '1hr' }
            );
            res.cookie('token', token, {
              // maxAge: 3600000,
              httpOnly: true,
              sameSite: 'none',
              secure: true
            });
            res.status(HttpStatusCode.OK).json('sign-in successful');
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

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token').json('logout successful');
};

export const checkAuth = (req: Request, res: Response): void => {
  const cookies = req.cookies;
  console.log(cookies);
  if (cookies.token) res.status(HttpStatusCode.OK).json('ok');
  else res.status(HttpStatusCode.UNATHORIZED);
};
