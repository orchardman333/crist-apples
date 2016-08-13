// databaseManager.js
// ========
var mysql   = require("mysql");

var pool  = mysql.createPool({
    host     : 'localhost',
    user     : 'root',
    database : 'orchard_run'
});

exports.pool = pool;

/*
host     : 'localhost',
user     : 'root',
password : '*****',
database : 'orchard_run'
*/
