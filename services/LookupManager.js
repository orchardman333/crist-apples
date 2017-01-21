// Returns a single bin's properties from its full tag

var db   = require("./DatabaseManager");
var decode = require("./BarcodeDecodingManager");
module.exports = {
  GetBinProperties: function (req,res) {
    var idValues = decode.decodeBarcode(req.body.barCode);
    if (idValues.typeBarcode == 'employee'){
      res.send({
        varietyName: '',
        strainName : '',
        blockName: ''
      });
    }
    else {
      idsToNames(idValues, function(data){
        res.json(data);
      });
    }
  }
};

var idsToNames = function(idValues, callback){
  var blockName=varietyName=strainName=bearingName=treatmentName=pickName=jobName = '';
  db.getConnection(function(err, connection) {

    //Block
    connection.query("SELECT `Block Name` AS blockname FROM block_table WHERE `Block ID` = '" + idValues.blockId + "'", function(err, blockRows, fields) {
      if (blockRows.length == 1)
      {
        blockName = blockRows[0].blockname;
      }
      else {
        blockName ='Error looking up block name in LookupManager.js';
      }
      //Variety
      connection.query("SELECT `Variety Name` AS varietyname FROM variety_table WHERE `Variety ID` = '" + idValues.varietyId + "'", function(err, varietyRows, fields) {
        if (varietyRows.length == 1)
        {
          varietyName = varietyRows[0].varietyname;
        }
        else {
          varietyName ='Error looking up variety name in LookupManager.js';
        }
        //Strain
        connection.query("SELECT `Strain Name` AS strainname FROM strain_table WHERE `Strain ID` = '" + idValues.strainId + "'", function(err, strainRows, fields) {
          if (strainRows.length == 1)
          {
            strainName = strainRows[0].strainname;
          }
          else {
            strainName='Error looking up strain name in LookupManager.js';
          }
          //Bearing
          connection.query("SELECT `Bearing Name` AS bearingname FROM bearing_table WHERE `Bearing ID` = '" + idValues.bearingId + "'", function(err, bearingRows, fields) {
            if (bearingRows.length == 1)
            {
              bearingName = bearingRows[0].bearingname;
            }
            else {
              bearingName='Error looking up bearing name in LookupManager.js';
            }
            //Treatment
            connection.query("SELECT `Treatment Name` AS treatmentname FROM treatment_table WHERE `Treatment ID` = '" + idValues.treatmentId + "'", function(err, treatmentRows, fields) {
              if (treatmentRows.length == 1)
              {
                treatmentName = treatmentRows[0].treatmentname;
              }
              else {
                treatmentName='Error looking up treatment name in LookupManager.js';
              }
              //Pick
              connection.query("SELECT `Pick Name` AS pickname FROM pick_table WHERE `Pick ID` = '" + idValues.pickId + "'", function(err, pickRows, fields) {
                if (pickRows.length == 1)
                {
                  pickName = pickRows[0].pickname;
                }
                else {
                  pickName='Error looking up pick name in LookupManager.js';
                }
                //Job
                connection.query("SELECT `Job Name` AS jobname FROM job_table WHERE `Job ID` = '" + idValues.jobId + "'", function(err, jobRows, fields) {
                  if (jobRows.length == 1)
                  {
                    jobName = jobRows[0].jobname;
                  }
                  else {
                    jobName='Error looking up job name in LookupManager.js';
                  }
                  callback({
                    blockName: blockName,
                    varietyName: varietyName,
                    strainName: strainName,
                    bearingName: bearingName,
                    treatmentName: treatmentName,
                    pickName: pickName,
                    jobName: jobName
                  });
                  connection.release();
                });
              });
            });
          });
        });
      });
    });
  });
}
