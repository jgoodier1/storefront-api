import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { validationResult } from 'express-validator';
import Stripe from 'stripe';
const stripe = new Stripe(
  'sk_test_51HKOZDEVSid6nUScJAr0VwQww6hg9pdAoo0Ob1HnT2gRftyPEuio3PoREBGPbZzqVt1OB1kojdh3RmoYO5p1s6ve00tD6Cwjzs',
  {
    apiVersion: '2020-08-27'
  }
);

import Product from '../models/product';
import User from '../models/user';
import Order from '../models/order';

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

export const getProducts = async (req: Request, res: Response): Promise<void> => {
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
    res.status(200).json({ products, totalItems });
  } catch (err) {
    console.log(err);
    res.status(400).json('nice try');
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  const { prodId } = req.params;
  try {
    const product = await Product.findById(prodId);
    res.status(200).json(product);
  } catch (err) {
    console.log(err);
    res.status(400).json('product not found');
  }
};

export const postCart = async (req: Request, res: Response): Promise<void> => {
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
    console.log(err);
  }
};

// eslint-disable-next-line
export const postOrder = async (req: Request, res: Response): Promise<any> => {
  const { cart, orderData, userId, shippingSpeed, totalPrice } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('no user found');
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
    res.status(500).json({ message: 'an error occured', err });
  }
};

export const postSecret = async (req: Request, res: Response): Promise<void> => {
  const { items, shippingSpeed, formValues, userId } = req.body;

  const calculateOrderAmount = async (
    items: cartProduct[],
    shippingSpeed: string,
    province: string
  ): Promise<number> => {
    // need to charge shipping and tax too.
    // need shipping price constants and tax too. Maybe these would be environment vars in real life
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
  // add the order and shipping info as metadata
  const intent = await stripe.paymentIntents.create({
    currency: 'cad',
    amount: await calculateOrderAmount(
      items.products,
      shippingSpeed,
      formValues.province
    ),
    payment_method_types: ['card'],
    metadata: {
      shippingSpeed,
      userId,
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      streetAddress: formValues.streetAddress,
      streetAddressTwo: formValues.streetAddressTwo,
      city: formValues.city,
      province: formValues.province,
      postalCode: formValues.postalCode,
      phoneNumber: formValues.phoneNumber
    }
  });

  res.json({ clientSecret: intent.client_secret });
};

//eslint-disable-next-line
export const webhook = async (req: Request, res: Response): Promise<any> => {
  // i feel like i have to deploy to actually test this?
  let event;
  try {
    event = req.body;
    console.log(event);
  } catch (err) {
    console.log(`Webhook error while parsing basic request.`, err.message);
    return res.send();
  }
  switch (event.type) {
    case 'charge.succeeded': {
      const { metadata } = event.data.object;
      try {
        const user = await User.findById(metadata.userId);
        // should prob verify this in postSecret
        if (!user) {
          throw new Error('no user found');
        }
        const order = new Order({
          products: metadata.items,
          totalPrice: event.data.object.amount_captured,
          shippingSpeed: metadata.shippingSpeed,
          contactInfo: {
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            streetAddress: metadata.streetAddress,
            streetAddressTwo: metadata.streetAddressTwo,
            city: metadata.city,
            province: metadata.province,
            country: 'Canada',
            postalCode: metadata.postalCode,
            phoneNumber: metadata.phoneNumber
          },
          user: {
            email: user.email,
            userId: metadata.userId
          }
        });
        await order.save();
      } catch (err) {
        //what do I do here???
        console.log(err);
      }
      break;
    }
    case 'charge.failed':
      console.log('Charge failed. Do something about this');
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  res.send();
};

export const postOrders = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ message: 'an error occurred', error: err });
  }
};

// eslint-disable-next-line
export const getSearch = async (req: Request, res: Response): Promise<any> => {
  const { value } = req.query;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json(errors.array());
  }
  if (typeof value === 'string') {
    // const regExp = new RegExp(value, 'i');
    try {
      // const results = await Product.find({ $text: { $search: regExp,  } }).exec();
      const results = await Product.find({
        title: { $regex: value, $options: 'i' }
      }).exec();
      res.status(200).json(results);
    } catch (err) {
      res.status(500).json({ message: 'an error occurred', error: err });
    }
  } else {
    res.status(500).json('an error occurred');
  }
};
