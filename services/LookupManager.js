// /GetVarietyStrainBlock
var mysql   = require("mysql");
var db   = require("./DatabaseManager");
module.exports = {
  GetVarietyStrainBlock: function (req,res) {

    var values = decodeBarCode(req.body.barCode);

    if (values.typeBarcode == 'employee'){
      res.send({
        varietyName: '',
        strainName :'',
        blockName: ''
      });
    }
    else {
      var getStrainVarietyBlockValues = function(values, callback){
        var varietyName = '';
        var strainName = '';
        var blockName = '';

        console.log(values);

        var conn = db.connection;
        conn().query("select `Variety Name` as name from variety_table where `Variety Id` ='" + values.varietyId +"'", function(err, rows, fields) {
          console.log(err);
          varietyName=rows.name;
        });

        conn().query("select `Strain Name` as name from strain_table where `Strain Id` ='" + values.stringId +"'", function(err, rows, fields) {
          strainName=rows.name;
        });

        conn().query("select `Block Name` as name from block_table where `Block Id` ='" + values.blockId +"'", function(err, rows, fields) {
          blockName = rows.name;
        });

        callback( {
          varietyName: varietyName,
          strainName :strainName,
          blockName: blockName
        });
      };

      getStrainVarietyBlockValues(values, function(data){
        res.json(data);
      });
    }
  }
};

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
        pickId: barcode.substring(12, 13),
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
