var db   = require("./DatabaseManager");
module.exports = {
  DoWork: function (req,res) {
    var sqlValues = [];
    if (req.body.shiftIn) {   //employee beginning shift
      db.getConnection(function (err, connection){
        sqlValues = [req.body.employeeId, null, req.body.jobId, req.body.managerId]
        var query = connection.query('INSERT INTO time_table VALUES (?, NOW(), ?, ?, ?)', sqlValues, function (error, results, fields) {
          if (error) throw error;
          connection.release();
        });
        console.log(query.sql);
      });
    }
    else {      //employee ending shift
      db.getConnection(function (err, connection){
        var query = connection.query('SELECT `Time In` AS timeIn, `Time Out` AS timeOut FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=CURDATE()) ORDER BY timeIn DESC LIMIT 1', [req.body.employeeId], function (error, results, fields) {
          if (error) throw error;
          if (results.length == 0) {
            console.log('no clock-in records');
          }
          else if (results.length == 1) {
            if (results[0].timeOut == null) {
              sqlValues = [req.body.employeeId, results[0].timeIn, results[0].timeIn]
              console.log(sqlValues);
              var query = connection.query('UPDATE time_table SET `Time Out` = NOW() WHERE `Employee ID`= ? AND `Time In`= ? AND (SELECT DATE(?) = CURDATE())', sqlValues, function (error, results, fields) {
                if (error) throw error;
                connection.release();
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
        });
        console.log(query.sql);
      });
    }
    res.send("Data Saved!");
  }
}
