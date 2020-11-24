import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';

import Product from '../models/product';
import User from '../models/user';
import Order from '../models/order';

interface product {
  title: string;
  image: string;
  price: number;
  // maybe not a string
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
          const something = {
            title: result.title,
            image: result.image,
            price: result.price,
            prodId: result._id,
            quantity: p.quantity
          };
          response.push(something);
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

export const postOrder = async (req: Request, res: Response): Promise<void> => {
  // verify the data with the data from the db
  const { cart, orderData, userId, shippingSpeed, totalPrice } = req.body;
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

export const postOrders = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;
  try {
    const orders = await Order.find({ 'user.userId': userId }).populate({
      path: 'products',
      populate: { path: 'prodId' }
    });
    // console.log(orders);
    if (!orders) {
      throw new Error('no orders found');
    }
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'an error occurred', error: err });
  }
};

export const getSearch = async (req: Request, res: Response): Promise<void> => {
  const { value } = req.query;
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

// export default shopController;

// exports.postCart = (req, res, next) => {
//   const { cart } = req.body;
//   let response = [];
//   cart.products
//     .forEach(p => {
//       Product.findById(p.prodId).then(result => {
//         let something = {
//           title: result.title,
//           image: result.image,
//           price: result.price,
//           prodId: result._id,
//           quantity: p.quantity
//         };
//         response.push(something);
//       });
//     })
//     .then(result2 => res.json(response));
// };

// exports.postCartOld = (req, res, next) => {
//   const { id, userId } = req.body;
//   // check to see if a cart exists for this session
//   // (maybe store the cart for unauth user in storage)
//   // if not, create a new cart and put the item in it
//   // if it exists, add the new item to it
//   // check to see if user is logged in (shouldn't matter until they try to order)

//   // do we need a cart schema? maybe the cart can just exist in storage

//   Product.findById(id)
//     .then(product => {
//       new Cart({
//         items: [{ prodId: product._id, quantity: 1 }],
//         userId: userId
//       });
//     })
//     .then(result => {
//       res.status(200).json(result);
//     })
//     .catch(err => {
//       console.log(err);
//       res.status(400).json(err);
//     });
// };

// exports.getCart = (req, res, next) => {
//   res.json('hello');
// req.user
//   .populate('cart.items.prodId')
//   .execPopulate()
//   .then((user) => {
//     const products = user.cart.items;
//     res.send(products);
//   })
//   .catch((err) => {
//     console.log(err);
//     res.status(400).json(err);
//   });
// };
