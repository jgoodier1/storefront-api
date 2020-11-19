const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('./src/models/user');

exports.postSignUp = (req, res, next) => {
  const { email, password, name } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  var salt = bcrypt.genSaltSync(10);
  bcrypt
    .hash(password, salt)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] }
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

exports.postSignIn = (req, res, next) => {
  const { email, password } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        res.status(422).json('Invalid email or password');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            // req.session.isLoggedIn = true;
            // req.session.user = user;
            jwt.sign({ user: user, isLoggedIn: true }, process.env.JWT, (err, token) => {
              console.log('JWT err', err);
              res.json({ token: token });
            }); // add admin:false or something later
            console.log('req.session', req.session);
            return req.session.save(err => {
              if (err) {
                console.log(err);
                res.status(422).json('something went wrong');
              }
              res.status(200).json('I think it worked');
            });
          }
          return res.status(422).json('Invalid email or password');
        })
        .catch(err => {
          res.status(400).json('something went wrong');
          console.log(err);
        });
    })
    .catch(err => {
      res.status(400).json('something went wrong');
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    console.log('req.session', req.session);
    res.status(200).json("i think you're logged out");
  });
};
