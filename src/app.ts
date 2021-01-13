import path from 'path';
import fs from 'fs';
import express, { Response, Request, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import 'dotenv/config';
import helmet from 'helmet';
import morgan from 'morgan';
// import adminRoutes from './routes/admin';
import shopRoutes from './routes/shop';
import authRoutes from './routes/auth';
import { NewError } from './error';

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {
  flags: 'a'
});

app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: accessLogStream }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Not using this on front end, so shouldn't have it available on backend
// app.use(adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

//eslint-disable-next-line
app.use((error: NewError, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(error.httpCode).json(error.message);
});

const port = process.env.PORT || 5000;

app.listen(port);
