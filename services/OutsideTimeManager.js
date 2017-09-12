const db = require("./DatabaseManager");
const asynch = require("async");
const util = require("util");

module.exports = {
  SeeWork: function(req,res) {
    var resObject = {
      timeData: [],
      crew: [],
      error: false
    };
    connect()
    .then(connection => {
      //Finds every employee's most recent time in that does not have a time out for a given date and manager
      return Promise.all([connection, queryDb(connection, 'SELECT subquery.*, `time_table`.`Time Out` AS timeOut, `time_table`.`Job ID` AS jobId FROM (SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, MAX(`time_table`.`Time In`) AS timeIn, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId) subquery JOIN `time_table` ON `time_table`.`time In`=subquery.timeIn AND `time_table`.`Employee ID`=subquery.employeeid WHERE `time_table`.`Time Out` IS NULL', [req.body.managerId, req.body.date]), queryDb(connection, 'SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId', [req.body.managerId, req.body.date])]);
    })
    .then(results => {
      results[0].release();   //release db connection
      resObject.timeData = results[1];
      resObject.crew = results[2];
      res.json(resObject);
    })
    .catch(error => {
      console.error(error);
      res.json({message:error.message, error:true});
    });
  },

  DoWork: function(req,res) {
    var sqlValues = [];
    connect()
    .then(connection => {
      return new Promise (function(resolve, reject) {
        //Employees ending shift
        if (req.body.shiftOut && req.body.employeeIds.length > 0) {
          asynch.each(req.body.employeeIds, function(employeeId, callback) {
            queryDb(connection,'SELECT `Time In` AS timeIn, `Time Out` AS timeOut, `Job ID` AS jobId, `Manager ID` AS managerId FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=?) ORDER BY timeIn DESC LIMIT 1', [employeeId, req.body.date])
            .then(results => {
              if (results.length == 0) {
                console.log('No expected clock-in records found for ' + employeeId);
              }
              else if (results.length == 1) {
                if (results[0].timeOut == null) {
                  //add lunch break
                  //INSERT after lunch shift
                  if (req.body.lunch) {
                    sqlValues = [[employeeId, req.body.lunchEnd, req.body.time, req.body.lunchEnd, req.body.timeOffered, results[0].jobId, results[0].managerId, null]];
                    return Promise.all([queryDb(connection, 'UPDATE time_table SET `Time Out` = ?, `Time Out Offered` = ? WHERE `Employee ID`= ? AND `Time In`= ?', [req.body.lunchStart, req.body.lunchStart, employeeId, results[0].timeIn]),queryDb(connection, 'INSERT INTO time_table VALUES ?', [sqlValues])]);
                  }
                  //no lunch break
                  else {
                    return queryDb(connection, 'UPDATE time_table SET `Time Out` = ?, `Time Out Offered` = ? WHERE `Employee ID`= ? AND `Time In`= ?', [req.body.time, req.body.timeOffered, employeeId, results[0].timeIn]);
                  }
                }
                else {
                  console.log('Most recent record already clocked out for ' + employeeId);
                }
              }
              else {
                console.log('error finding clock-in record');
              }
            })
            .then(results => {
              callback();
            })
            .catch(error =>
              callback(error)
            )
          }, function (error) {
            if (error) reject(error);
            else resolve(connection);
          });
        }
        else resolve(connection);
      })
    })
    .then(connection => {
      //Employees beginning shift
      if (req.body.shiftIn && req.body.employeeIds.length > 0) {
        sqlValues = [];
        for (var i=0; i < req.body.employeeIds.length; i++) {
          sqlValues.push([req.body.employeeIds[i], req.body.time, null, req.body.timeOffered, null, req.body.jobId, req.body.managerId, null]);
        }
        //INSERT new records
        return queryDb(connection, 'INSERT INTO time_table VALUES ?', [sqlValues]);
      }
      else return Promise.resolve(null);
    })
    .then(results => {
      //results[0].release();
      res.json({message:'DB Success!', error:false});
    })
    .catch(error => {
      console.error(error);
      res.json({message: error.message, error:true});
    })
  }
}

function connect() {
  return new Promise (function(resolve, reject) {
    db.getConnection(function(error, connection) {
      if (error) reject(error);
      else resolve(connection);
    });
  });
}
function queryDb(connection, queryString, sqlValues) {
  return new Promise (function (resolve, reject) {
    var query = connection.query(queryString, sqlValues, function(error, results, fields) {
      if (error) reject(error);
      else resolve(results);
    });
    console.log(query.sql);
  });
}
