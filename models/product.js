const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});
// https://stackoverflow.com/questions/28775051/best-way-to-perform-a-full-text-search-in-mongodb-and-mongoose
productSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
