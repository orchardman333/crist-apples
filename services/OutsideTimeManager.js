var db   = require("./DatabaseManager");
var asynch = require("async");

module.exports = {
  SeeWork: function(req,res) {
    var resObject = {
      timeData: [],
      error: false
    };
    db.getConnection(function (error, connection) {
      if (error) {
        console.log(error.message);
        res.json({message:error.message, error:true});
        return;
      }
      //Finds every employee's most recent time in that does not have a time out for a given date and manager
      var query = connection.query('SELECT subquery.*, `time_table`.`Time Out` AS timeOut, `time_table`.`Job ID` AS jobId FROM (SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, MAX(`time_table`.`Time In`) AS timeIn, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId) subquery JOIN `time_table` ON `time_table`.`time In`=subquery.timeIn AND `time_table`.`Employee ID`=subquery.employeeid WHERE `time_table`.`Time Out` IS NULL', [req.body.managerId, req.body.date], function (error, results, fields) {
        if (error) {
          console.log(error.message);
          res.json({message:error.message, error:true});
        }

        resObject.timeData = results;
        var query = connection.query('SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId', [req.body.managerId, req.body.date], function (error, results, fields) {
          resObject.crew = results;
          connection.release();
          res.json(resObject);
        });
        console.log(query.sql);
      });
      console.log(query.sql);
    });
  },

  DoWork: function(req,res) {
    var sqlValues = [];
    //Employees beginning shift
    if (req.body.shiftIn && req.body.employeeIds.length > 0) {
      for (var i=0; i < req.body.employeeIds.length; i++) {
        sqlValues.push([req.body.employeeIds[i], req.body.time, null, req.body.jobId, req.body.managerId, null]);
      }
      db.getConnection(function (err, connection) {
        //INSERT new records
        var query = connection.query('INSERT INTO time_table VALUES ?', [sqlValues], function (error, results, fields) {
          if (error) {
            console.log(error.message);
            res.json({message:error.message, error:true});
          }
          else {
            res.json({message:'DB Success!', error:false});
          }
          connection.release();
        });
        console.log(query.sql);
      });
    }
    //Employees ending shift
    else {
      db.getConnection(function (err, connection){
        asynch.each(req.body.employeeIds, function(employeeId, callback) {
          var query = connection.query('SELECT `Time In` AS timeIn, `Time Out` AS timeOut, `Job ID` AS jobId, `Manager ID` AS managerId FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=?) ORDER BY timeIn DESC LIMIT 1', [employeeId, req.body.date], function (error, results, fields) {
            // if (error) {
            //   console.log(error.message);
            //   res.json({message: error.message, error:true});
            // }
            if (results.length == 0) {
              console.log('No expected clock-in records found for ' + employeeId);
            }
            else if (results.length == 1) {
              if (results[0].timeOut == null) {
                //add lunch break
                if (req.body.lunch) {
                  sqlValues = [req.body.lunchStart, employeeId, results[0].timeIn];
                  var query = connection.query('UPDATE time_table SET `Time Out` = ? WHERE `Employee ID`= ? AND `Time In`= ?', sqlValues, function (error, results, fields) {
                    // if (error) {
                    //   console.log(error.message);
                    //   res.json({message: error.message, error:true});
                    // }
                  });
                  console.log(query.sql);
                  //INSERT after lunch shift
                  sqlValues = [employeeId, req.body.lunchEnd, req.body.time, results[0].jobId, results[0].managerId, null];
                  var query = connection.query('INSERT INTO time_table VALUES (?,?,?,?,?,?)', sqlValues, function (error, results, fields) {
                    // if (error) {
                    //   console.log(error.message);
                    //   res.json({message:error.message, error:true});
                    // }
                    // else {
                    //   res.json({message:'DB Success!', error:false});
                    // }
                    //connection.release();
                  });
                  console.log(query.sql);
                }
                //no lunch break
                else {
                  sqlValues = [req.body.time, employeeId, results[0].timeIn];
                  var query = connection.query('UPDATE time_table SET `Time Out` = ? WHERE `Employee ID`= ? AND `Time In`= ?', sqlValues, function (error, results, fields) {
                    // if (error) {
                    //   console.log(error.message);
                    //   res.json({message: error.message, error:true});
                    // }
                  });
                  console.log(query.sql);
                }
              }
              else {
                console.log('Most recent record already clocked out for ' + employeeId);
              }
            }
            else {
              console.log('error finding clock-in record');
            }
            callback();
          });
          console.log(query.sql);
        }, function (error) {
          if (error) {
            console.log(error.message);
            res.json({message: error.message, error:true});
          }
          else {
            res.json({message: 'DB Success!', error:false});
          }
          connection.release();
        });
      });
    }
  }
}
