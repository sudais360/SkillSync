const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  host: 'sql12.freesqldatabase.com',
  user: 'sql12707225',
  password: 'qWjl1aHt9y',
  database: 'sql12707225',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Execute a test query
pool.query('SELECT 1', (error, results, fields) => {
  if (error) {
    console.error('Error connecting to the database:', error);
  } else {
    console.log('Connected to the database successfully.');
    console.log('Query result:', results);
  }
});
