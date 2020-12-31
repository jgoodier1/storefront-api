import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';

// import adminRoutes from './routes/admin';
import shopRoutes from './routes/shop';
import authRoutes from './routes/auth';

// const MONGODB_URI = process.env.MONGODB_URI;

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Not using this on front end, so shouldn't have it available on backend
// app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

const port = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI as string, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    app.listen(port);
  })
  .catch(err => console.log(err));
