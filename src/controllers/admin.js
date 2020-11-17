const Product = require('../models/product');
const jwt = require('jsonwebtoken');

exports.postAddProduct = (req, res, next) => {
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

exports.getEditProduct = (req, res, next) => {
  // console.log('req.query', req.query);
  const prodId = req.query.id;
  Product.findById(prodId)
    .then(product => res.send(product))
    .catch(err => res.status(500).json('An error occurred. We are working on fixing it'));
};

exports.postEditProduct = (req, res, next) => {
  const { title, image, price, description, id } = req.body;
  Product.findById(id).then(product => {
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
      .then(result => {
        console.log('UPDATED PRODUCT');
        res.status(200).json('updated product');
      })
      .catch(err => {
        console.log(err);
        res.status(400).json('An error occurred. Please try again.');
      });
  });
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.id;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.status(404).json('an error occurred, please try again');
      }
      if (product.userId.toString() !== req.userId) {
        return res.status(401).json('not authorized');
      }
      return Product.deleteOne({ _id: prodId });
    })
    .then(result => {
      res.status(200).json('product deleted');
      console.log('product deleted');
    })
    .catch(err => {
      res.status(400).json(err);
      console.log(err);
    });
};
