const Product = require('../models/product');
const User = require('../models/user');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.send(products);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('nice try');
    });
};

exports.getProduct = (req, res, next) => {
  const { prodId } = req.params;
  Product.findById(prodId)
    .then(product => {
      res.status(200).json(product);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json('product not found');
    });
};

exports.postCart = async (req, res, next) => {
  const { products } = req.body;
  let response = [];
  try {
    if (products && products.length > 0) {
      await products.forEach(async p => {
        let result = await Product.findById(p.prodId);
        let something = {
          title: result.title,
          image: result.image,
          price: result.price,
          prodId: result._id,
          quantity: p.quantity
        };
        response.push(something);
      });
      setTimeout(() => res.json(response), 500); // this is definitely not the way to do it, but it works.
    } else {
      res.status(400).json({ message: 'Cart is empty' });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.postCartDelete = (req, res, next) => {
  const { id } = req.body;
  req.user
    .removeCart(id)
    .then(result => {
      res.status(200).json(result);
    })
    .catch(err => {
      console.log(err);
      res.status(400).json(err);
    });
};

exports.postOrder = async (req, res, next) => {
  // verify the data with the data from the db
  const { orderedCart, orderData, userId, shippingSpeed } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('no user found');
    }
    const order = new Order({
      products: orderedCart.products,
      subTotal: orderedCart.subTotal,
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

exports.postOrders = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const orders = await Order.find({ 'user.userId': userId })
      .populate({
        path: 'products',
        populate: {path: 'prodId'}
      });
    console.log(orders)
    if (!orders) {
      throw new Error('no orders found');
    }
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: 'an error occurred', error: err });
  }
};

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
