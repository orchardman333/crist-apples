// Retrieve list of trucks or truck drivers
// ========
const db = require("./DatabaseManager");
const query = require("./QueryManager")

module.exports = {
  GetTrucks: function (req, res) {
    query.standardStack(db, res, 'SELECT `Truck ID` AS id, `Truck Name` AS name FROM truck_table ORDER BY name ASC', null);
  },

  GetTruckDrivers: function (req, res) {
    query.standardStack(db, res, 'SELECT `Employee ID` AS id, CONCAT(`Employee First Name`,\' \',`Employee Last Name`) AS name FROM employee_table WHERE `Truck Driver`', null);
  }
};
