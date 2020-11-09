const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
// const csrf = require('csurf');
const bodyParser = require('body-parser');
require('dotenv').config();

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');

const MONGODB_URI =
  'mongodb+srv://jacob:5qiVMpvMzcAtIvDC@cluster0.5e1rk.mongodb.net/shop';

const app = express();

// const csrfProtection = csrf();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(csrfProtection);

// app.use((req, res, next) => {
//   if (!req.session.user) {
//     return next();
//   }
//   User.findById(req.session.user._id)
//     .then((user) => {
//       req.user = user;
//       next();
//     })
//     .catch((err) => console.log(err));
// });
// CHANGE THIS TO USE TOKENS FOR AUTO-SIGNIN

app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

const port = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    app.listen(port);
  })
  .catch((err) => console.log(err));

// const user = new User({
//   email: 'test@test.com',
//   password: 'hello',
//   cart: {
//     items: [],
//   },
// });
// user.save();
