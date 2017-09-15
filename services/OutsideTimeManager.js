const db = require("./DatabaseManager");
const query = require("./QueryManager")
const asynch = require("async");

module.exports = {
  SeeWork: function(req,res) {
    var resObject = {
      timeData: [],
      crew: [],
      error: false
    };
    //Connect to database
    query.connectOnly(db)
    .then(connection => {
      //Finds every employee's most recent time in that does not have a time out for a given date and manager
      return Promise.all([connection, query.queryOnly(connection, 'SELECT subquery.*, `time_table`.`Time Out` AS timeOut, `time_table`.`Job ID` AS jobId FROM (SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, MAX(`time_table`.`Time In`) AS timeIn, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId) subquery JOIN `time_table` ON `time_table`.`time In`=subquery.timeIn AND `time_table`.`Employee ID`=subquery.employeeid WHERE `time_table`.`Time Out` IS NULL', [req.body.managerId, req.body.date]), query.queryOnly(connection, 'SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId', [req.body.managerId, req.body.date])]);
    })
    .then(results => {
      //Release db connection and send response
      results[0].release();   //release db connection
      resObject.timeData = results[1];
      resObject.crew = results[2];
      res.json(resObject);
    })
    .catch(error => {
      //Respond with error if thrown
      console.error(error);
      res.json({message:error.message, error:true});
    });
  },

  DoWork: function(req,res) {
    var queryValues = [];
    //Connect to database
    query.connectOnly(db)
    .then(connection => {
      return new Promise ((resolve, reject) => {
        //Employees ending shift
        if (req.body.shiftOut && req.body.employeeIds.length > 0) {
          //For each employee, find the specified day's most recent
          asynch.each(req.body.employeeIds, function(employeeId, callback) {
            query.queryOnly(connection,'SELECT `Time In` AS timeIn, `Time Out` AS timeOut, `Job ID` AS jobId, `Manager ID` AS managerId FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=?) ORDER BY timeIn DESC LIMIT 1', [employeeId, req.body.date])
            .then(results => {
              //Only 1 record found
              if (results.length == 1) {
                //Only found record has no timeOut
                if (results[0].timeOut == null) {
                  //Include lunch break
                  if (req.body.lunch) {
                    //UPDATE morning entry, INSERT afternoon shift
                    queryValues = [[employeeId, req.body.lunchEnd, req.body.time, req.body.lunchEnd, req.body.timeOffered, results[0].jobId, results[0].managerId, null]];
                    return Promise.all([query.queryOnly(connection, 'UPDATE time_table SET `Time Out` = ?, `Time Out Offered` = ? WHERE `Employee ID`= ? AND `Time In`= ?', [req.body.lunchStart, req.body.lunchStart, employeeId, results[0].timeIn]), query.queryOnly(connection, 'INSERT INTO time_table VALUES ?', [queryValues])]);
                  }
                  //No lunch break
                  else {
                    return query.queryOnly(connection, 'UPDATE time_table SET `Time Out` = ?, `Time Out Offered` = ? WHERE `Employee ID`= ? AND `Time In`= ?', [req.body.time, req.body.timeOffered, employeeId, results[0].timeIn]);
                  }
                }
              }
            })
            .then(results => {
              callback();   //asynch.each iteration successfully completed
            })
            .catch(error => {
              callback(error);    //asynch.each iteration failed, break to final callback
            })
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
        queryValues = [];
        for (var i=0; i < req.body.employeeIds.length; i++) {
          queryValues.push([req.body.employeeIds[i], req.body.time, null, req.body.timeOffered, null, req.body.jobId, req.body.managerId, null]);
        }
        //INSERT new records
        return Promise.all([connection, query.queryOnly(connection, 'INSERT INTO time_table VALUES ?', [queryValues])]);
      }
      else return Promise.all([connection]);
    })
    .then(results => {
      results[0].release();   //release db connection
      res.json({message:'DB Success!', error:false});
    })
    //Catch any errors and respond
    .catch(error => {
      console.error(error);
      res.json({message: error.message, error:true});
    })
  }
};
