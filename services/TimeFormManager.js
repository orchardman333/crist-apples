var db   = require("./DatabaseManager");
module.exports = {
  DoWork: function (req,res) {
    var sqlValues = [];
    var resObject = {};
    if (req.body.shiftIn) {   //employee beginning shift
      db.getConnection(function (err, connection){
        sqlValues = [req.body.employeeId, null, req.body.jobId, req.body.managerId, null];
        var query = connection.query('INSERT INTO time_table VALUES (?, NOW(), ?, ?, ?, ?)', sqlValues, function (error, results, fields) {
          if (error) throw error;
          connection.release();
          resObject.message = 'Hooray! Clock-in successful';
          res.json(resObject);

        });
        console.log(query.sql);
      });
    }
    else {      //employee ending shift
      db.getConnection(function(err, connection) {
        var query = connection.query('SELECT `Time In` AS timeIn, `Time Out` AS timeOut FROM time_table WHERE `Employee ID`= ? AND (DATE(`Time In`)=CURDATE()) ORDER BY timeIn DESC LIMIT 1', [req.body.employeeId], function (error, results, fields) {
          if (error) throw error;
          if (results.length == 0) {
            resObject.message = 'Error! No previous clock-in records found';
            resObject.error = true;
            res.json(resObject);

          }
          else if (results.length == 1) {
            if (results[0].timeOut == null) {
              sqlValues = [req.body.employeeId, results[0].timeIn, results[0].timeIn]
              console.log(sqlValues);
              var query = connection.query('UPDATE time_table SET `Time Out` = NOW() WHERE `Employee ID`= ? AND `Time In`= ? AND (SELECT DATE(?) = CURDATE())', sqlValues, function (error, results, fields) {
                if (error) throw error;
                connection.release();
                resObject.message = 'Hooray! Clock-out successful';
                resObject.error = false;
                res.json(resObject);
              });
              console.log(query.sql);
            }

            else {
              resObject.message = 'Error! Already clocked out';
              resObject.error = true;
              res.json(resObject);

            }
          }
          else {
            resObject.message = 'General Error';
            resObject.error = true;
            res.json(resObject);

          }
        });
        console.log(query.sql);
      });
    }
  }
}
