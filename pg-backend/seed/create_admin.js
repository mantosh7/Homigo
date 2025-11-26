const pool = require('../db');
const bcrypt = require('bcrypt');

async function run(){
  const name = 'Admin';
  const email = 'admin@pg.local';
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  await pool.query('INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hash]);
  console.log('Admin created:', email);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
