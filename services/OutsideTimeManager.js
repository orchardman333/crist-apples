var db   = require("./DatabaseManager");
var asynch = require("async");

module.exports = {
  SeeWork: function(req,res) {
    var object = {
      timeData: []
    };
    db.getConnection(function (err, connection){
      var query = connection.query('SELECT subquery.*, `time_table`.`Time Out` AS timeOut, `time_table`.`Job ID` AS jobId FROM (SELECT `time_table`.`Employee ID` AS employeeId, `employee_table`.`Employee First Name` AS firstName, `employee_table`.`Employee Last Name` AS lastName, MAX(`time_table`.`Time In`) AS timeIn, `time_table`.`Manager ID` AS managerId FROM `time_table` JOIN `employee_table` ON `employee_table`.`Employee ID` = `time_table`.`Employee ID` WHERE `Manager ID`= ? AND (DATE(`Time In`)=?) GROUP BY employeeId) subquery JOIN `time_table` ON `time_table`.`time In`=subquery.timeIn AND `time_table`.`Employee ID`=subquery.employeeid WHERE ISNULL(`time_table`.`Time Out`)', [req.body.managerId, req.body.dateSelect], function (error, results, fields) {
        if (error) throw error;
        if (results.length == 0) {
          console.log('no clock-in records');
        }
        else {
          for (var i=0; i<results.length; i++) {
            object.timeData.push({employeeId: results[i].employeeId, employeeName: results[i].firstName+' '+results[i].lastName, timeIn: results[i].timeIn, managerId: results[i].managerId, jobId: results[i].jobId })
          }
        }
        connection.release();
        res.json(object);
      });
      console.log(query.sql);
    });
  },

  DoWork: function(req,res) {
    var sqlValues = [];
    if (req.body.shiftIn && req.body.employeeIds.length > 0) {   //employees beginning shift
      for (var i=0; i < req.body.employeeIds.length; i++) {
        //INSERT new records
        sqlValues.push([req.body.employeeIds[i], req.body.time, null, req.body.jobId, req.body.managerId, null]);
      }
      db.getConnection(function (err, connection){
        var query = connection.query('INSERT INTO time_table VALUES ?', [sqlValues], function (error, results, fields) {
          if (error) throw error;
          connection.release();
        });
        console.log(query.sql);
      });
    }
    else {      //employees ending shift
      db.getConnection(function (err, connection){
        asynch.each(req.body.employeeIds, function(employeeId, callback) {
          var query = connection.query('SELECT `Time In` AS timeIn, `Time Out` AS timeOut FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=?) ORDER BY timeIn DESC LIMIT 1', [employeeId, req.body.dateSelect], function (error, results, fields) {
            if (error) throw error;
            if (results.length == 0) {
              console.log('no clock-in records');
            }
            else if (results.length == 1) {
              if (results[0].timeOut == null) {
                sqlValues = [req.body.time, employeeId, results[0].timeIn];
                var query = connection.query('UPDATE time_table SET `Time Out` = ? WHERE `Employee ID`= ? AND `Time In`= ?', sqlValues, function (error, results, fields) {
                  if (error) throw error;
                });
                console.log(query.sql);
              }
              else {
                console.log('most recent record already clocked out');
              }
            }
            else {
              console.log('error finding clock-in record');
            }
            callback();
          });
          console.log(query.sql);
        }, function (err) {
          if (err) throw err;
          connection.release();
          res.json({message: 'SUCCESS!'});
        });
      });
    }
  }
}
