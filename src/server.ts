import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// const csrf = require('csurf');
import bodyParser from 'body-parser';
import 'dotenv/config';

import adminRoutes from './routes/admin';
import shopRoutes from './routes/shop';
import authRoutes from './routes/auth';
// const User = require('./models/user');

// const faker = require('../faker');

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

// app.post('/fake', faker.postFaker);

const port = process.env.PORT || 5000;

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    app.listen(port);
  })
  .catch(err => console.log(err));

// const user = new User({
//   email: 'test@test.com',
//   password: 'hello',
//   cart: {
//     items: [],
//   },
// });
// user.save();
