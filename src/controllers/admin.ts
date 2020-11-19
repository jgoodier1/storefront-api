// import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import Product from '../models/product';

export const postAddProduct = (req: Request, res: Response): void => {
  // if keeping this, add userId to body (i think)
  const { title, image, price, description } = req.body;
  const product = new Product({
    title: title,
    image: image,
    price: price,
    description: description,
    userId: req.userId
  });
  console.log(product);
  product
    .save()
    .then(result => {
      console.log(result);
      console.log('Created Product');
      res.status(200).json('good job, i guess');
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('An error occurred. Please try again.');
    });
};

export const getEditProduct = (req: Request, res: Response): void => {
  // console.log('req.query', req.query);
  const prodId = req.query.id;
  Product.findById(prodId)
    .then(product => res.send(product))
    .catch(err =>
      res
        .status(500)
        .json({ message: 'An error occurred. We are working on fixing it', err })
    );
};

export const postEditProduct = (req: Request, res: Response): void => {
  const { title, image, price, description, id } = req.body;
  Product.findById(id).then(product => {
    if (product && req.userId) {
      if (product.userId.toString() !== req.userId.toString()) {
        res.status(401).json('not authorized');
        return;
      }
      product.title = title;
      product.image = image;
      product.price = price;
      product.description = description;
      return product
        .save()
        .then(() => {
          console.log('UPDATED PRODUCT');
          res.status(200).json('updated product');
        })
        .catch(err => {
          console.log(err);
          res.status(400).json('An error occurred. Please try again.');
        });
    }
  });
};

//eslint-disable-next-line
export const postDeleteProduct = async (req: Request, res: Response): Promise<any> => {
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
    res.status(400).json(err);
    console.log(err);
  }
};
