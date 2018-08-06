//Create object for creating daily time report

const db = require("./DatabaseManager");
const query = require("./QueryManager");

module.exports = {
  DailyTime: function(req,res) {
    //Connect to database
    query.connectOnly(db)
    .then(results => {
      //Finds every employee's most recent time in that does not have a time out for a given date and manager
      return query.queryOnly(results.connection, 'SELECT ROUND(HOUR(TIMEDIFF(time_table.`Time Out`, time_table.`Time In`)) + MINUTE(TIMEDIFF(time_table.`Time Out`, time_table.`Time In`))/60,3) AS hours, time_table.`Employee ID` AS employeeId, employee_table.`Department ID` AS departmentId FROM time_table INNER JOIN employee_table ON employee_table.`Employee ID`=time_table.`Employee ID` WHERE DATE(`Time In`) = DATE(?) AND employee_table.`Department ID` IN ? ORDER BY employee_table.`Department ID`,time_table.`Employee ID`,time_table.`Time In` ASC', [req.body.date, [req.body.departmentIds]]);
    })
    .then(results => {
      //Release db connection and send response
      results.connection.release();   //release db connection
      res.json({timeData: results.data, error: false});
    })
    .catch(error => {
      //Respond with error if thrown
      if (!error.getConnectionError) error.connection.release();
      res.json({error: true, message: error.data.name + ' ' + error.data.message});
      console.error(error.data);
    });
  }
};
