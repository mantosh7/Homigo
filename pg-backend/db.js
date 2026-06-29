// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || '127.0.0.1',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '',
//   database: process.env.DB_NAME || 'pg_manager',
//   waitForConnections: true,
//   connectionLimit: 10
// });

// module.exports = pool;


const mysql = require('mysql2/promise')
require('dotenv').config()

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 4000,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  ssl: {
    minVersion: 'TLSv1.2'
  },

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

module.exports = pool