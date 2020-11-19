import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

interface orderDoc extends mongoose.Document {
  products: [prodId: ObjectId, quantity: number, price: number];
  totalPrice: number;
  contactInfo: {
    firstName: string;
    lastName: string;
    streetAddress: string;
    streetAddressTwo: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    phoneNumber: string;
  };
  shippingSpeed: string;
  user: {
    email: string;
    userId: ObjectId;
  };
}

const orderSchema = new Schema(
  {
    products: [
      {
        prodId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    },
    contactInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      streetAddress: { type: String, required: true },
      streetAddressTwo: { type: String, required: false },
      city: { type: String, required: true },
      province: { type: String, required: true },
      country: { type: String, required: true },
      postalCode: { type: String, required: true },
      phoneNumber: { type: String, required: true }
    },
    shippingSpeed: { type: String, required: true },
    user: {
      email: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    }
  },
  { timestamps: true }
);

export default mongoose.model<orderDoc>('Order', orderSchema);
