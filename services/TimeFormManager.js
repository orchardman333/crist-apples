var db   = require("./DatabaseManager");
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
          else if (results.length == 0) {
            res.json({message:'Error! No previous clock-in records found', error:true});
            connection.release();
          }
          //Employee has one time in
          else if (results.length == 1) {
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
              res.json({message:'Error! Your most recent record has been clocked out', error:true});
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
  }
}
