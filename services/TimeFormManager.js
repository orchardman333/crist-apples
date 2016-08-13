var db   = require("./DatabaseManager").pool;
module.exports = {
  DoWork: function (req,res) {

    var sql = "select count(*) as count from orchard_run.timecalc_table where `Employee ID` = '" + req.body.employee.id + "' and `Job Id` = '" + req.body.job_id +"'"
    console.log(sql);
    db.getConnection(function(err, connection) {
      connection.query(sql, function(err, rows, fields){
          console.log("count is: " + rows[0].count);
          if (rows[0].count == 0 ){
            // Do Insert
            var insertSql = "insert into timecalc_table (`Employee ID`, time_in, `Job ID`) values ('" + req.body.employee.id + "', now(), '" + req.body.job_id + "')";
            console.log(insertSql);
            connection.query(insertSql, function(err, res){
              console.log(err);
              connection.commit(function(err) {
              })
            });
          }
          else{
            // Do update
            var updateSql = "update timecalc_table set time_out = now() where `Employee ID` = '" + req.body.employee.id + "' and `Job Id` = '" + req.body.job_id +"'" ;
            console.log(updateSql);
            connection.query(updateSql, function(err, res){
              console.log(err);
              connection.commit(function(err) {
              })
            });
          }
        });
      connection.release()
    });
    res.send("Data Saved!");
  }
};
