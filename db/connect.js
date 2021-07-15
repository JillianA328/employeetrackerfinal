const mysql = require('mysql2');

const dbConnect = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'employeetracker'
})

module.exports = dbConnect;
