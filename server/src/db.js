import mysql from 'mysql2';
import dotenv from 'dotenv';

dotenv.config();

const con = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
  port: process.env.DBPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default con;
