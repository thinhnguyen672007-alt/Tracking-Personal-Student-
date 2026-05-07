const mysql = require('mysql2/promise');

require('dotenv').config();

const pool = mysql.createPool({
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    name : process.env.DB_NAME,
    waitForConnections : true,
    connectionLimit : 10,
    enableKeepAlive : true,
    ssl: {
    rejectUnauthorized: false
  }
})

async function testConnection() {
    try{
         const conn = await pool.getConnection();
         console.log("✅Database connection")
         conn.release();
    } catch (error) {
        console.log("❌Fail to connect database!", error.message);
        process.exit(1);    
    }
}
testConnection();
module.exports = pool;