import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

export interface productDoc extends mongoose.Document {
  _id: ObjectId;
  title: string;
  price: number;
  image: string;
  description: string;
  userId: ObjectId;
}

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
productSchema.index({ title: 'text', description: 'text' });

export default mongoose.model<productDoc>('Product', productSchema);
