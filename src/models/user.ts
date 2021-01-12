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
  static findById(id: string): any {
    return db.query('SELECT * FROM users WHERE user_id = $1', [id]);
  }

  //eslint-disable-next-line
  static findByEmail(email: string): Promise<any> {
    return db.query('SELECT * FROM users WHERE email = $1', [email]);
  }
}

export default User;
