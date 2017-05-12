// Returns a single [bin's properties or employee's name] from its full tag
'use strict'
var db = require("./DatabaseManager");
var decode = require("./BarcodeDecodingManager");
var async = require("async");
var properties = ['block', 'variety', 'strain', 'bearing', 'treatment', 'pick', 'job'];   //order is important here

module.exports = {
  GetBarcodeProperties: function (req,res) {
    // var t0 = now();
    var object={error: false, errorProp: null};
    var idValues = decode.decodeBarcode(req.body.barCode);
    //employee barcode
    if (idValues.typeBarcode == 'emp') {
      var name = '';
      db.getConnection(function(err, connection) {
        var query = connection.query('SELECT `Employee First Name` AS firstName, `Employee Last Name` AS lastName FROM employee_table WHERE `Employee ID` = ?', [idValues.empId], function(error, results, fields) {
          try {
            object['employeeName'] = results[0].firstName + ' ' + results[0].lastName;
          }
          catch (err) {
            object['employeeName']='ERROR!';
            object['error'] = true;
            object['errorProp'] = 'EMPLOYEE';
          }
          res.json(object);
          connection.release();
        });
        console.log(query.sql);
      });
    }
    //bin barcode
    else if (idValues.typeBarcode == 'bin') {
      db.getConnection(function(err, connection) {
        async.eachOf(properties, function(property, index, callback) {
          // console.log(now()-t0);
          var query = connection.query('SELECT `'+ property +' Name` AS prop FROM `'+ property +'_table` WHERE `'+ property + ' ID` = ?', [idValues.idArray[index]], function(error, results, fields) {

            // if (error) throw error
            // {object['sqlerror']=error;}
            //             else
            try {
              object[property + 'Name'] = results[0].prop;
            }
            catch (err) {
              object[property + 'Name']='ERROR!';
              object['error'] = true;
              object['errorProp'] = property.toUpperCase();
            }
            // console.log(now()-t0);
            callback();
          });
          console.log(query.sql);
        },
        function(err) {
          if (err) throw err;
          res.json(object);
          connection.release();
          // console.log(now()-t0);
        }
      );
    });
  }
}
}

// recursive algorithm
// db.getConnection(function(err, connection) {
//   select(t0, connection, idValues.idArray, 0, {}, properties, function(data){
//     res.json(data);
//     connection.release();
//     console.log(now()-t0);
//   });
// });
// binIdsToNames(idValues, function(data){
//   res.json(data);
// });
//
//       function select (t0, connection, idArray, index, object, properties, callback) {
//         if (index < properties.length) {
//           console.log(now()-t0);
//           connection.query('SELECT `'+ properties[index][3] +'` AS prop FROM `'+ properties[index][1] +'` WHERE `'+ properties[index][2] +"` = '" + idArray[index] + "'", function(error, results, fields) {
//             console.log(now()-t0);
//             if (results.length == 1)
//             {
//               object[properties[index][0] + 'Name'] = results[0].prop;
//             }
//             else {
//               object[properties[index][0] + 'Name'] = 'Error looking up name in LookupManager.js';
//             }
//             select(t0, connection, idArray, ++index, object, properties, callback);
//             return;
//           });
//         }
//         else {
//           callback(object);
//         }
//       };
// callback hell algorithm
// var binIdsToNames = function(idValues, callback){
//   var blockName=varietyName=strainName=bearingName=treatmentName=pickName=jobName = '';
//   db.getConnection(function(err, connection) {
//
//     //Block
//     connection.query("SELECT `Block Name` AS blockname FROM block_table WHERE `Block ID` = '" + idValues.blockId + "'", function(err, blockRows, fields) {
//       if (blockRows.length == 1)
//       {
//         blockName = blockRows[0].blockname;
//       }
//       else {
//         blockName ='Error looking up block name in LookupManager.js';
//       }
//       //Variety
//       connection.query("SELECT `Variety Name` AS varietyname FROM variety_table WHERE `Variety ID` = '" + idValues.varietyId + "'", function(err, varietyRows, fields) {
//         if (varietyRows.length == 1)
//         {
//           varietyName = varietyRows[0].varietyname;
//         }
//         else {
//           varietyName ='Error looking up variety name in LookupManager.js';
//         }
//         //Strain
//         connection.query("SELECT `Strain Name` AS strainname FROM strain_table WHERE `Strain ID` = '" + idValues.strainId + "'", function(err, strainRows, fields) {
//           if (strainRows.length == 1)
//           {
//             strainName = strainRows[0].strainname;
//           }
//           else {
//             strainName='Error looking up strain name in LookupManager.js';
//           }
//           //Bearing
//           connection.query("SELECT `Bearing Name` AS bearingname FROM bearing_table WHERE `Bearing ID` = '" + idValues.bearingId + "'", function(err, bearingRows, fields) {
//             if (bearingRows.length == 1)
//             {
//               bearingName = bearingRows[0].bearingname;
//             }
//             else {
//               bearingName='Error looking up bearing name in LookupManager.js';
//             }
//             //Treatment
//             connection.query("SELECT `Treatment Name` AS treatmentname FROM treatment_table WHERE `Treatment ID` = '" + idValues.treatmentId + "'", function(err, treatmentRows, fields) {
//               if (treatmentRows.length == 1)
//               {
//                 treatmentName = treatmentRows[0].treatmentname;
//               }
//               else {
//                 treatmentName='Error looking up treatment name in LookupManager.js';
//               }
//               //Pick
//               connection.query("SELECT `Pick Name` AS pickname FROM pick_table WHERE `Pick ID` = '" + idValues.pickId + "'", function(err, pickRows, fields) {
//                 if (pickRows.length == 1)
//                 {
//                   pickName = pickRows[0].pickname;
//                 }
//                 else {
//                   pickName='Error looking up pick name in LookupManager.js';
//                 }
//                 //Job
//                 connection.query("SELECT `Job Name` AS jobname FROM job_table WHERE `Job ID` = '" + idValues.jobId + "'", function(err, jobRows, fields) {
//                   if (jobRows.length == 1)
//                   {
//                     jobName = jobRows[0].jobname;
//                   }
//                   else {
//                     jobName='Error looking up job name in LookupManager.js';
//                   }
//                   callback({
//                     blockName: blockName,
//                     varietyName: varietyName,
//                     strainName: strainName,
//                     bearingName: bearingName,
//                     treatmentName: treatmentName,
//                     pickName: pickName,
//                     jobName: jobName
//                   });
//                   connection.release();
//                 });
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// }
