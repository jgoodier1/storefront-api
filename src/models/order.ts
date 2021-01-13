import db from '../database';

class Order {
  products: string;
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
  email: string;
  userId: string;
  date: Date;
  constructor(
    products: string,
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
    email: string,
    userId: string,
    date: Date
  ) {
    this.products = products;
    this.totalPrice = totalPrice;
    this.contactInfo = contactInfo;
    this.shippingSpeed = shippingSpeed;
    this.email = email;
    this.userId = userId;
    this.date = date;
  }

  //eslint-disable-next-line
  async save(): Promise<any> {
    return await db.query(
      `INSERT INTO orders
      (user_id, email,products, total_price, shipping_speed,date, first_name, last_name,
        street_address, street_address_two, city, province, country,
        postal_code, phone_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, $14, $15)`,
      [
        this.userId,
        this.email,
        this.products,
        this.totalPrice,
        this.shippingSpeed,
        this.date,
        this.contactInfo.firstName,
        this.contactInfo.lastName,
        this.contactInfo.streetAddress,
        this.contactInfo.streetAddressTwo,
        this.contactInfo.city,
        this.contactInfo.province,
        this.contactInfo.country,
        this.contactInfo.postalCode,
        this.contactInfo.phoneNumber
      ]
    );
  }

  //eslint-disable-next-line
  static async find(userId: string): Promise<any> {
    const query = await db.query('SELECT * FROM orders WHERE user_id = $1', [userId]);
    return query.rows;
  }
}

export default Order;
