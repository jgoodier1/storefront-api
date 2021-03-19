import path from 'path';
import express, { Response, Request, NextFunction } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import helmet from 'helmet';
import shopRoutes from './routes/shop';
import authRoutes from './routes/auth';
import { NewError } from './error';

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(shopRoutes);
app.use(authRoutes);

// need `next` here or the error middleware won't work
//eslint-disable-next-line
app.use((error: NewError, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  res.status(error.httpCode).json(error.message);
});

const port = process.env.PORT || 5000;

app.listen(port);
