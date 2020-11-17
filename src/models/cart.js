// NOT USING THIS RIGHT NOW

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  items: [
    {
      prodId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ]
  // userId: {
  //   type: Schema.Types.ObjectId,
  //   ref: 'User',
  //   required: false,
  // },
});

cartSchema.methods.addToCart = function (product) {
  const productIndex = this.items.findIndex(cp => {
    return cp.prodId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  const updatedCartItems = [...this.items];

  if (productIndex >= 0) {
    newQuantity = this.items[productIndex].quantity + 1;
    updatedCartItems[productIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      prodId: product._id,
      quantity: newQuantity
    });
  }

  this.items = updatedCartItems;
  return this.save();
};

module.exports = mongoose.model('Cart', cartSchema);
