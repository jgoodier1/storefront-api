import jwt from 'jsonwebtoken';
import { Request, NextFunction, Response } from 'express';

interface error extends Error {
  statusCode?: number;
}

interface decodedTokenInterface {
  userId?: string;
}

const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.get('Authorization');
  console.log(authHeader);
  if (!authHeader) {
    const error: error = new Error('not authenticated');
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(' ')[1];
  let decodedToken: decodedTokenInterface | string;
  try {
    // does this catch if it fails??
    if (process.env.JWT !== undefined) {
      decodedToken = jwt.verify(token, process.env.JWT);
      // had to change this to make it work, it was otuside the catch before
      if (decodedToken === undefined) {
        const error: error = new Error('not authenticated');
        error.statusCode = 401;
        throw error;
      }
      if (typeof decodedToken !== 'string') req.userId = decodedToken.userId;
      next();
    }
  } catch (err) {
    err.statusCode = 500;
    throw err;
  }
};

export default isAuth;
