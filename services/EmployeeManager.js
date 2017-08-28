// Retrieve employees
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetEmployees: function (res) {
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table', function(error, results, fields) {
        connection.release();
        res.json(results);
      });
      console.log(query.sql);
    });
  },

  GetManagers: function (res) {
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Manager`', function(error, results, fields) {
        connection.release();
        res.json(results);
      });
      console.log(query.sql);
    });
  },

  EmployeeLookup: function (req, res) {
    var object = {};
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Employee ID` = ?', [req.body.barcode], function(error, results, fields) {
        try {
          object = results[0];
        }
        catch (err) {
          object['error'] = true;
          object['errorProp'] = 'EMPLOYEE';
        }
        res.json(object);
        connection.release();
      });
      console.log(query.sql);
    });
  }
};
