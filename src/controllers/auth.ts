import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';

import User from '../models/user';

// eslint-disable-next-line
export const postSignUp = (req: Request, res: Response): any => {
  const { email, password, name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  const salt = bcrypt.genSaltSync(10);
  bcrypt
    .hash(password, salt)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword
      });
      return user.save();
    })
    .then(result => {
      res.status(200).json('signup complete');
      console.log(result);
    })
    .catch(err => {
      res.status(400).json('something went wrong');
      console.log(err);
    });
};

// eslint-disable-next-line
export const postSignIn = (req: Request, res: Response): any => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        res.status(422).json({ message: 'Invalid email or password' });
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
              return res.status(422).json('Invalid email or password');
            }
          })
          .catch(err => {
            res.status(400).json('something went wrong');
            console.log(err);
          });
      }
    })
    .catch(err => {
      res.status(400).json('something went wrong');
      console.log(err);
    });
};

// exports.postLogout = (req, res, next) => {
//   req.session.destroy((err) => {
//     console.log('logout err', err);
//     console.log('req.session', req.session);
//     res.status(200).json("i think you're logged out");
//   });
// };
