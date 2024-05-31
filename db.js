/** Database setup for BizTime. */

const { Client } = require("pg");

const DB_URI = (process.env.NODE_ENV === "test")
? "biztime_test" : "biztime";

let db = new Client({
    user: 'client',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: DB_URI
});

db.connect();

module.exports = db;