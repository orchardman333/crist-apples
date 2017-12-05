const db = require("./DatabaseManager");
const query = require("./QueryManager");

module.exports = {
  DoWork: function (req,res) {
    //Employee beginning shift
    if (req.body.shiftIn) {
      db.getConnection(function (err, connection) {
        var sqlValues = [req.body.employeeId, null, null, null, req.body.jobId, req.body.managerId, null];
        var query = connection.query('INSERT INTO time_table VALUES (?, NOW(), ?, ?, ?, ?, ?, ?)', sqlValues, function (error, results, fields) {
          if (error) {
            console.log(error.message);
            res.json({message:error.message, error:true});
          }
          else {
            res.json({message:'Hooray! Clock-in successful', error:false});
          }
          connection.release();
        });
        console.log(query.sql);
      });
    }
    //Employee ending shift
    else {
      db.getConnection(function(err, connection) {
        //Find employee's most recent time in
        var query = connection.query('SELECT `Time In` AS timeIn, `Time Out` AS timeOut FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=CURDATE()) ORDER BY timeIn DESC LIMIT 1', [req.body.employeeId], function (error, results, fields) {
          if (error) {
            console.log(error.message);
            res.json({message:error.message, error:true});
            connection.release();
          }
          //Employee has no clock-in today
          else if (results.length === 0) {
            var sqlValues = [req.body.employeeId, null, null, 'H000', req.body.managerId, null];
            var query = connection.query('INSERT INTO time_table VALUES (?, CURDATE(), NOW(), ?, ?, ?, ?, ?)', sqlValues, function (error, results, fields) {
              if (error) {
                console.log(error.message);
                res.json({message:error.message, error:true});
              }
              else {
                res.json({message:'Warning! No previous clock-in records found today', error:true});
              }
              connection.release();
            });
          }
          //Employee has one time in
          else if (results.length === 1) {
            //Correct case: employee's most recent time in today has no time out
            if (results[0].timeOut == null) {
              var query = connection.query('UPDATE time_table SET `Time Out` = NOW() WHERE `Employee ID`= ? AND `Time In`= ?', [req.body.employeeId, results[0].timeIn], function (error, results, fields) {
                if (error) {
                  console.log(error.message);
                  res.json({message:error.message, error:true});
                }
                else {
                  res.json({message:'Hooray! Clock-out successful', error:false});
                }
                connection.release();
              });
              console.log(query.sql);
            }
            //Wrong case: employee's most recent time in today has time out already recorded
            else {
              var sqlValues = [req.body.employeeId, null, null, 'H000', req.body.managerId, null];
              var query = connection.query('INSERT INTO time_table VALUES (?, CURDATE(), NOW(), ?, ?, ?, ?, ?)', sqlValues, function (error, results, fields) {
                if (error) {
                  console.log(error.message);
                  res.json({message:error.message, error:true});
                }
                else {
                  res.json({message:'Warning! Your most recent record has been clocked out', error:true});
                }
                connection.release();
              });
              console.log(query.sql);
            }
          }
          //Catch other cases
          else {
            res.json({message:'General Error', error:true});
            connection.release();
          }
        });
        console.log(query.sql);
      });
    }
  },
  SeeWork: function(req,res){
    query.standardStack(db, res, 'SELECT `Employee ID` AS `employeeId`, DATE(`Time In`) AS `date`, DAYNAME(`Time In`) AS `day`, SUM(HOUR(TIMEDIFF(time_table.`Time Out`,time_table.`Time In`)) + MINUTE(TIMEDIFF(time_table.`Time Out`,time_table.`Time In`))/60) AS `time` FROM time_table WHERE time_table.`Employee ID` = ? AND time_table.`Time In` > DATE_SUB(CURDATE(),INTERVAL 5 day) GROUP BY `date` ORDER BY `date` DESC', [req.query.employeeId])
  }
}
