// Create pooled connection to database
// ========
var mysql = require("mysql");

module.exports = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'orchard_run'
})
