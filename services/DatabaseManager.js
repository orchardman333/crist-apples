// Create pooled connection to database
// ========
var mysql = require("mysql");

module.exports = mysql.createPool({
  host     : 'cb-production.cf6eebznfzpb.us-east-1.rds.amazonaws.com',
  user     : 'root',
  password : 'cristbros',
  database : 'orchard_run2017'
})
