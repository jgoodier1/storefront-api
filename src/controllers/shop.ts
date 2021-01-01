import { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_KEY as string, {
  apiVersion: '2020-08-27'
});

import Product from '../models/product';
import User from '../models/user';
import Order from '../models/order';
import { NewError, HttpStatusCode } from '../error';

interface product {
  title: string;
  image: string;
  price: number;
  prodId: ObjectId;
  quantity: number;
}

interface cartProduct {
  prodId: ObjectId;
  quantity: number;
}

export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let currentPage;
  if (req.query.page !== undefined) {
    currentPage = +req.query.page;
  } else {
    currentPage = 1;
  }
  const perPage = 10;
  let totalItems;
  try {
    totalItems = await Product.find().countDocuments();
    const products = await Product.find()
      .skip((currentPage - 1) * 10)
      .limit(perPage);
    if (!products || !totalItems) {
      const error = new NewError('Products not found', HttpStatusCode.NOT_FOUND);
      return next(error);
    }
    res.status(200).json({ products, totalItems });
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { prodId } = req.params;
  try {
    const product = await Product.findById(prodId);
    if (!product) {
      const error = new NewError('product not found', HttpStatusCode.NOT_FOUND);
      return next(error);
    }
    res.status(200).json(product);
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const postCart = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { products } = req.body;
  const response: product[] = [];
  try {
    if (products && products.length > 0) {
      await products.forEach(async (p: cartProduct) => {
        const result = await Product.findById(p.prodId);
        if (result) {
          const prod = {
            title: result.title,
            image: result.image,
            price: result.price,
            prodId: result._id,
            quantity: p.quantity
          };
          response.push(prod);
        } else return;
      });
      setTimeout(() => res.json(response), 500); // this is definitely not the way to do it, but it works.
    } else {
      res.status(400).json({ message: 'Cart is empty' });
    }
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const postOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line
): Promise<any> => {
  const { cart, orderData, userId, shippingSpeed, totalPrice } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NewError('no user found', HttpStatusCode.NOT_FOUND);
    }
    // probably shouldn't hard code this here
    orderData.country = 'Canada';
    const order = new Order({
      products: cart.products,
      totalPrice,
      contactInfo: orderData,
      shippingSpeed,
      user: {
        email: user.email,
        userId: userId
      }
    });
    await order.save();
    res.status(200).json({ message: 'order success', order });
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const postSecret = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { items, shippingSpeed, formValues } = req.body;

  const calculateOrderAmount = async (
    items: cartProduct[],
    shippingSpeed: string,
    province: string
  ): Promise<number> => {
    const priceArray: number[] = [];
    for await (const p of items) {
      const product = await Product.findById(p.prodId).exec();
      if (!product) continue;
      const totalPrice = product.price * p.quantity;
      priceArray.push(totalPrice);
    }
    let subTotal: number;
    if (priceArray.length === 0) subTotal = 0;
    else subTotal = priceArray.reduce((a, b) => a + b);
    let tax: number;
    switch (province) {
      case 'Alberta':
        tax = subTotal * 0.05;
        break;
      case 'British Columbia':
        tax = subTotal * 0.12;
        break;
      case 'Manitoba':
        tax = subTotal * 0.12;
        break;
      case 'New Brunswick':
        tax = subTotal * 0.15;
        break;
      case 'Newfoundland and Labrador':
        tax = subTotal * 0.15;
        break;
      case 'Northwest Territories':
        tax = subTotal * 0.05;
        break;
      case 'Nova Scotia':
        tax = subTotal * 0.15;
        break;
      case 'Nunavut':
        tax = subTotal * 0.05;
        break;
      case 'Ontario':
        tax = subTotal * 0.13;
        break;
      case 'Prince Edward Island':
        tax = subTotal * 0.15;
        break;
      case 'Quebec':
        tax = subTotal * 0.14975;
        break;
      case 'Saskatchewan':
        tax = subTotal * 0.11;
        break;
      case 'Yukon':
        tax = subTotal * 0.05;
        break;
      default:
        tax = subTotal;
        break;
    }
    const afterTax = tax + subTotal;
    let amount: number;
    if (subTotal < 35 && shippingSpeed === 'normal') amount = +(afterTax + 5).toFixed(2);
    else if (shippingSpeed === 'fast') amount = +(afterTax + 10).toFixed(2);
    else amount = +afterTax.toFixed(2);
    console.log({ subTotal, tax, afterTax, amount });
    return amount * 100;
  };
  try {
    const intent = await stripe.paymentIntents.create({
      currency: 'cad',
      amount: await calculateOrderAmount(
        items.products,
        shippingSpeed,
        formValues.province
      ),
      payment_method_types: ['card']
    });

    res.json({ clientSecret: intent.client_secret });
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const postOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.body;
  try {
    const orders = await Order.find({ 'user.userId': userId }).populate({
      path: 'products',
      populate: { path: 'prodId' }
    });
    if (!orders) {
      throw new Error('no orders found');
    }
    res.status(200).json(orders);
  } catch (err) {
    const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
    return next(error);
  }
};

export const getSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
  // eslint-disable-next-line
): Promise<any> => {
  const { value } = req.query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  if (typeof value === 'string') {
    try {
      const results = await Product.find({
        title: { $regex: value, $options: 'i' }
      }).exec();
      res.status(200).json(results);
    } catch (err) {
      const error = new NewError(err, HttpStatusCode.INTERNAL_SERVER);
      return next(error);
    }
  } else {
    const error = new NewError('Invalid query', HttpStatusCode.BAD_REQUEST);
    return next(error);
  }
};
