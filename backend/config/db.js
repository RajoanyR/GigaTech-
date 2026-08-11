/**
 * Pool de connexions MySQL (mysql2/promise).
 * Un pool evite d'ouvrir/fermer une connexion a chaque requete : meilleures performances.
 */
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gigatech',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  decimalNumbers: true,
  dateStrings: false,
});

/** Verifie la connexion au demarrage du serveur. */
async function testConnection() {
  const conn = await pool.getConnection();
  await conn.ping();
  conn.release();
}

/** Execute une fonction dans une transaction (commit/rollback automatiques). */
async function withTransaction(handler) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await handler(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { pool, testConnection, withTransaction };
