import db from '../database';

class Product {
  userId: number;
  title: string;
  price: number;
  image: string;
  description: string;

  constructor(
    userId: number,
    title: string,
    price: number,
    image: string,
    description: string
  ) {
    this.title = title;
    this.price = price;
    this.image = image;
    this.description = description;
    this.userId = userId;
  }

  //eslint-disable-next-line
  save(): any {
    return db.query(
      'INSERT INTO products (userId, title, price, image, description) VALUES ($1, $2, $3, $4, $5)',
      [this.userId, this.title, this.price, this.image, this.description]
    );
  }

  //eslint-disable-next-line
  static findById(id: string): any {
    return db.query('SELECT * FROM products WHERE id = $1', [id]);
  }

  //eslint-disable-next-line
  static find(): any {
    return db.query('SELECT * FROM products');
  }

  //eslint-disable-next-line
  static search(searchValue: string): any {
    return db.query(
      'SELECT * FROM products WHERE title ILIKE $1 OR description ILIKE $1',
      [searchValue]
    );
  }

  //eslint-disable-next-line
  static deleteOne(id: string): any {
    return db.query('DELETE FROM products WHERE id = $1', [id]);
  }
}

export default Product;
