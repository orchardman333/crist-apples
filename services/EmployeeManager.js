// Retrieve employees
// ========

var db   = require("./DatabaseManager");
module.exports = {
  GetEmployees: function (res) {
    var getData = function(callback){
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
          callback(employeeList);
        });
        console.log(query.sql);
      });
    };

    getData(function(employeeList){
      res.json(employeeList);
    });
  },
  GetManagers: function (res) {
    var getData = function(callback){
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
          callback(managerList);
        });
        console.log(query.sql);
      });
    };

    getData(function(managerList){
      res.json(managerList);
    });
  }
};
