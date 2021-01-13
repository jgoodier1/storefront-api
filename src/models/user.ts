import db from '../database';

class User {
  name: string;
  email: string;
  password: string;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  //eslint-disable-next-line
  save(): any {
    return db.query('INSERT INTO users (name, email,  pass_hash) VALUES ($1, $2, $3)', [
      this.name,
      this.email,
      this.password
    ]);
  }

  //eslint-disable-next-line
  static async findById(id: string): Promise<any> {
    const query = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return query.rows[0];
  }

  //eslint-disable-next-line
  static async findByEmail(email: string): Promise<any> {
    const query = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return query.rows[0];
  }
}

export default User;
