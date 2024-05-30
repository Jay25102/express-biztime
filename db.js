/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_URI = "postgresql:///biztime";

let db = new Client({
    user: 'client',
    password: 'password',
    host: 'localhost',
    port: 5432,
    database: "biztime"
});

db.connect();

module.exports = db;