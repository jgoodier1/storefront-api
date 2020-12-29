import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface userDoc extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  cart: ObjectId;
}

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  cart: {
    type: Schema.Types.ObjectId,
    ref: 'Cart',
    required: false
  }
});

export default mongoose.model<userDoc>('User', userSchema);
