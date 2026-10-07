import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // default XAMPP kosong
    database: 'db_smi_temp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default pool;