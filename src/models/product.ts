import db from '../database';

interface ProductQuery {
  prod_id: number;
  title: string;
  price: string;
  image: string;
  description: string;
  quantity?: number;
}

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

  static async findById(id: string): Promise<ProductQuery> {
    const query = await db.query('SELECT * FROM products WHERE prod_id = $1', [id]);
    return query.rows[0];
  }

  static async find(limit: number, offset: number): Promise<ProductQuery[]> {
    const query = await db.query('SELECT * FROM products LIMIT $1 OFFSET $2', [
      limit,
      offset
    ]);
    return query.rows;
  }

  static async count(): Promise<number> {
    const query = await db.query('SELECT COUNT(prod_id) FROM products');
    return query.rows[0].count;
  }

  static async search(searchValue: string): Promise<ProductQuery[]> {
    const query = await db.query(
      "SELECT * FROM products WHERE title ILIKE ('%' || $1 || '%') OR description ILIKE ('%' ||$1 || '%')",
      [searchValue]
    );
    return query.rows;
  }
}

export default Product;
