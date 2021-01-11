import db from '../database';

class Order {
  // needs to be an array of these objects, not just references to the products table
  // maybe it'd be easiest as json?
  products: { prodId: string; quantity: number; price: number }[];
  totalPrice: number;
  // could be it's own table
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
    userId: string;
  };
  constructor(
    products: { prodId: string; quantity: number; price: number }[],
    totalPrice: number,
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
    },
    shippingSpeed: string,
    user: {
      email: string;
      userId: string;
    }
  ) {
    this.products = products;
    this.totalPrice = totalPrice;
    this.contactInfo = contactInfo;
    this.shippingSpeed = shippingSpeed;
    this.user = user;
  }

  //eslint-disable-next-line
  save(): any {
    return db.query('');
  }

  //eslint-disable-next-line
  static find(userId: string): any {
    return db.query('SELECT * FROM orders WHERE userId = $1', [userId]);
  }
}

export default Order;
