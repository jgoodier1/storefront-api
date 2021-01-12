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
  static async findById(id: string): Promise<any> {
    const query = await db.query('SELECT * FROM products WHERE prod_id = $1', [id]);
    return query.rows[0];
  }

  //eslint-disable-next-line
  static async find(limit: number, offset: number): Promise<any> {
    const query = await db.query('SELECT * FROM products LIMIT $1 OFFSET $2', [
      limit,
      offset
    ]);
    return query.rows;
  }

  //eslint-disable-next-line
  static async count(): Promise<any> {
    const query = await db.query('SELECT COUNT(prod_id) FROM products');
    return query.rows[0].count;
  }

  //eslint-disable-next-line
  static async search(searchValue: string): Promise<any> {
    const query = await db.query(
      "SELECT * FROM products WHERE title ILIKE ('%' || $1 || '%') OR description ILIKE ('%' ||$1 || '%')",
      [searchValue]
    );
    return query.rows;
  }

  //eslint-disable-next-line
  static deleteOne(id: string): any {
    return db.query('DELETE FROM products WHERE id = $1', [id]);
  }
}

export default Product;
