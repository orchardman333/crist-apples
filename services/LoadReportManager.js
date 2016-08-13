var db   = require("./DatabaseManager").pool;
module.exports = {
  LoadReport: function (res) {
    var getData = function(callback){
      db.getConnection(function(err, connection) {
        connection.query("select bin.`Bin ID` as bin_id, `Variety ID` as variety, `Strain ID` as strain, `Block ID` as block, `Date Picked` as date_picked, GROUP_CONCAT(`Employee ID` SEPARATOR ', ') as EmployeeIDs from bin_table bin left join boxes_table boxes on bin.`Bin ID` = boxes.`Bin ID` group by bin.`Bin ID` order by `Date Picked` desc", function(err, rows, fields) {
          if (err) throw err;

          var loadReports = [];
          for(var x=0; x<rows.length; x++){
            var row = rows[x];
            loadReports.push({
              bin_id: row.bin_id,
              strain: row.string,
              variety: row.variety,
              block_names: row.block,
              date_picked: row.date_picked,
              pickers: row.EmployeeIDs
            });
          }
          callback(loadReports);
        });
        connection.release();

      });
    }

    getData(function(loadReports){
      res.json(loadReports);
    });
  }
};
