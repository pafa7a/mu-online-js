const mysql = require('mysql2');
const config = require('./config/db');

// Create a pool of database connections
const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.MuOnlineDB,
  connectionLimit: 10
});

const query = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    // Get a connection from the pool.
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err);
        return;
      }

      // Execute the query.
      connection.query(sql, values, (err, results) => {
        // Release the connection back to the pool.
        connection.release();

        if (err) {
          reject(err);
          return;
        }

        resolve(results);
      });
    });
  });
};

module.exports = query;
