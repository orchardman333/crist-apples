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
    // var sql = "select count(*) as count from orchard_run.timecalc_table where `Employee ID` = '" + req.body.employee.id + "' and `Job Id` = '" + req.body.job_id +"'"
    // console.log(sql);
    // db.getConnection(function(err, connection) {
    //   connection.query(sql, function(err, rows, fields){
    //       console.log("count is: " + rows[0].count);
    //       if (rows[0].count == 0 ){
    //         // Do Insert
    //         var insertSql = "insert into timecalc_table (`Employee ID`, time_in, `Job ID`) values ('" + req.body.employee.id + "', now(), '" + req.body.job_id + "')";
    //         console.log(insertSql);
    //         connection.query(insertSql, function(err, res){
    //           console.log(err);
    //           connection.commit(function(err) {
    //           })
    //         });
    //       }
    //       else{
    //         // Do update
    //         var updateSql = "update timecalc_table set time_out = now() where `Employee ID` = '" + req.body.employee.id + "' and `Job Id` = '" + req.body.job_id +"'" ;
    //         console.log(updateSql);
    //         connection.query(updateSql, function(err, res){
    //           console.log(err);
    //           connection.commit(function(err) {
    //           })
    //         });
    //       }
    //     });
