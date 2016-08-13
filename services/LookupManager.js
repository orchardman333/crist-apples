// /GetVarietyStrainBlock

var db   = require("./DatabaseManager").pool;
module.exports = {
  GetVarietyStrainBlock: function (req,res) {
    var values = decodeBarCode(req.body.barCode);
    if (values.typeBarcode == 'employee'){
      res.send({
        varietyName: '',
        strainName : '',
        blockName: ''
      });
    }
    else {
      doWork(values.varietyId, values.strainId, values.blockId, function(data){
        res.json(data);
      });
    }
  }
};

var doWork = function(varietyId,strainId, blockId, callback ){
  var variety, strain, block = '';
  var conn = db.connection;
  db.getConnection(function(err, connection) {

    connection.query("select `Variety Name` as vname from variety_table where `Variety Id` ='" + varietyId+"'", function(err, rows, fields) {
      if (rows.length == 1)
      {
        varietyName = rows[0].vname;
      }
      else {
        varietyName='';
      }
      connection.query("select `Strain Name` as name from strain_table where `Strain Id` ='" + strainId +"'", function(err, r, fields) {
        if (r.length == 1)
        {
          strain = r[0].name;
        }
        else {
          strain='';
        }
        connection.query("select `Block Name` as name from block_table where `Block Id` ='" + blockId +"'", function(err, t, fields) {
          console.log(blockId);
          if (typeof t === "undefined"){
            block='';
          }else {
            if (t.length == 1)
            {
              block = t[0].name;
            }
            else {
              block='';
            }
          }
          callback({varietyName: varietyName,strainName:strain,blockName:block});
          connection.release();
        });
      });
    });
  });
}

var decodeBarCode = function(barcode){
  var values = {};
  if (barcode.length == 17){
      values = {
        typeBarcode : 'bin',
        lengthBarCode: 17,
        strainId: barcode.substring(0, 2),
        varietyId: barcode.substring(2, 4),
        blockId: barcode.substring(4, 7),
        jobId: barcode.substring(7, 11),
        pickId: barcode.substring(11, 12),
        binId: barcode.substring(12, 17)
     }
  }
   else if (barcode.length ==15) {
      values = {
        typeBarcode : 'bin',
        lengthBarCode: 15,
        varietyId: barcode.substring(0, 2),
        blockId:  barcode.substring(2, 5),
        jobId:  barcode.substring(5, 9),
        pickId:  barcode.substring(9, 10),
        binId:  barcode.substring(10, 15)
        }
    }
  else {
    //this is an employee barcode
    values = {
      typeBarcode : 'employee',
      eeId : barcode
    }
  }
  return values;
};
