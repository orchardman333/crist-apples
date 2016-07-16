// databaseManager.js
// ========
var mysql   = require("mysql");

module.exports = {
  connection: function () {

    return mysql.createConnection({
      host     : 'localhost',
      user     : 'root',
      database : 'orchard_run'
    })
}};

/*
host     : 'localhost',
user     : 'root',
password : '*****',
database : 'orchard_run'
*/
