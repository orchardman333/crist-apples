// Create pooled connection to database
// ========
var mysql = require("mysql");

module.exports = mysql.createPool({
  host     : '192.168.1.3',
  user     : 'root',
  password : 'rootroot',
  database : 'orchard_run2017'
})
