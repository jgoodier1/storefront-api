import db from '../database';

interface UserQuery {
  user_id: number;
  name: string;
  email: string;
  pass_hash: string;
}

class User {
  name: string;
  email: string;
  password: string;

  constructor(name: string, email: string, password: string) {
    this.name = name;
    this.email = email;
    this.password = password;
  }

  async save(): Promise<void> {
    await db.query('INSERT INTO users (name, email,  pass_hash) VALUES ($1, $2, $3)', [
      this.name,
      this.email,
      this.password
    ]);
  }

  static async findById(id: string): Promise<UserQuery> {
    const query = await db.query('SELECT * FROM users WHERE user_id = $1', [id]);
    return query.rows[0];
  }

  static async findByEmail(email: string): Promise<UserQuery> {
    const query = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return query.rows[0];
  }
}

export default User;
