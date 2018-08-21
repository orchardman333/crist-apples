// Retrieve list of all employees/managers or individual
// ========
const db = require("./DatabaseManager");
const query = require("./QueryManager")

module.exports = {
  GetEmployees: function (req, res) {
    query.standardStack(db, res, 'SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table', null);
  },

  GetManagers: function (req, res) {
    query.standardStack(db, res, 'SELECT `Employee ID` AS id, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Manager`', null);
  },

  EmployeeLookup: function (req, res) {
    query.standardStack(db, res, 'SELECT `Employee ID` as employeeId, `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Employee ID` = ?', [req.query.employeeId]);
  }
};
