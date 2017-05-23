// Retrieve employees
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetEmployees: function (res) {
    var employeeList = [];
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table', function(error, results, fields) {
        connection.release();
        for (var i=0; i<results.length; i++) {
          employeeList.push({
            id: results[i].id,
            name: results[i].firstName + ' ' + results[i].lastName
          });
        }
        res.json(employeeList);
      });
      console.log(query.sql);
    });
  },

  GetManagers: function (res) {
    var managerList = [];
    db.getConnection(function(err, connection) {
      var query = connection.query('SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Manager`', function(error, results, fields) {
        connection.release();
        for (var i=0; i<results.length; i++) {
          managerList.push({
            id: results[i].id,
            name: results[i].firstName + ' ' + results[i].lastName
          });
        }
        res.json(managerList);
      });
      console.log(query.sql);
    });
  },

  EmployeeLookup: function (req, res) {
    if (req.body.barcode.length == 6) {
      var object = {};
      db.getConnection(function(err, connection) {
        var query = connection.query('SELECT `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Employee ID` = ?', [req.body.barcode], function(error, results, fields) {
          try {
            object['employeeName'] = results[0].firstName + ' ' + results[0].lastName;
          }
          catch (err) {
            object['employeeName']='ERROR!';
            object['error'] = true;
            object['errorProp'] = 'EMPLOYEE';
          }
          res.json(object);
          connection.release();
        });
        console.log(query.sql);
      });
    }
  }
};
