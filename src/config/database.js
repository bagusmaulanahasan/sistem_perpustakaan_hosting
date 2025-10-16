const mysql = require('mysql2/promise');
require('dotenv').config(); // Biarkan baris ini untuk development lokal

// Tambahkan log di sini
console.log('Database host:', process.env.MYSQLHOST);
console.log('Database user:', process.env.MYSQLUSER);
console.log('Database password:', process.env.MYSQLPASSWORD);
console.log('Database database:', process.env.MYSQLDATABASE);
console.log('Database port:', process.env.MYSQLPORT);

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;