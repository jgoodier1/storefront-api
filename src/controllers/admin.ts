// NOT USING THIS
// This might not work now because I changed everything to try/catch and didn't test it

// import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { HttpStatusCode, NewError } from '../error';
import Product from '../models/product';

export const postAddProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // if keeping this, add userId to body (i think)
  const { title, image, price, description } = req.body;
  try {
    const product = new Product({
      title: title,
      image: image,
      price: price,
      description: description,
      userId: req.userId
    });
    console.log(product);
    const result = await product.save();
    console.log(result);
    console.log('Created Product');
    res.status(200).json('good job, i guess');
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const getEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // console.log('req.query', req.query);
  const prodId = req.query.id;
  try {
    const product = await Product.findById(prodId);
    res.send(product);
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const postEditProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
  //eslint-disable-next-line
): Promise<any> => {
  const { title, image, price, description, id } = req.body;
  try {
    const product = await Product.findById(id);
    if (product && req.userId) {
      if (product.userId.toString() !== req.userId.toString()) {
        res.status(401).json('not authorized');
        return;
      }
      product.title = title;
      product.image = image;
      product.price = price;
      product.description = description;
      await product.save();
      console.log('UPDATED PRODUCT');
      return res.status(200).json('updated product');
    }
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const postDeleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
  //eslint-disable-next-line
): Promise<any> => {
  const prodId = req.body.id;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      return res.status(404).json('an error occurred, please try again');
    }
    if (product.userId.toString() !== req.userId) {
      return res.status(401).json('not authorized');
    }
    await Product.deleteOne({ _id: prodId });
    res.status(200).json('product deleted');
    console.log('product deleted');
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};
