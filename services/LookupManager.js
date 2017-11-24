// Returns a single [bin's properties or employee's name] from its full tag
const db = require("./DatabaseManager");
const query = require("./QueryManager");
const asynch = require("async");

const longQuery = `SELECT
\`Bin ID\` AS binId,
block_table.\`Block Name\` AS blockName,
variety_table.\`Variety Name\` AS varietyName,
strain_table.\`Strain Name\` AS strainName,
\`Bushels\` AS bushels
FROM bin_table
INNER JOIN block_table ON bin_table.\`Block ID\` = block_table.\`Block ID\`
INNER JOIN variety_table ON bin_table.\`Variety ID\` = variety_table.\`Variety ID\`
INNER JOIN strain_table ON bin_table.\`Strain ID\` = strain_table.\`Strain ID\`
WHERE \`Bin ID\` = ?`.replace(/\n/g, ' ')    // Removes new-line characters

const shortQuery = 'SELECT `Bin ID` AS binId, FROM bin_table WHERE `Bin ID` = ?'.replace(/\n/g, ' ')    // Removes new-line characters

module.exports = {
  //Check if bin has entered db
  BinCheckShort: function(req,res) {
    query.standardStack(db, res, shortQuery, [req.query.binId]);
  },
  //Check if bin has entered db with properties
  BinCheckLong: function(req,res) {
    query.standardStack(db, res, longQuery, [req.query.binId]);
  },
  //Take bin's IDs and return full names to frontend
  BinLookup: function(req,res) {
    var resObject = module.exports.decodeBarcode(req.query.barcode, false);
    query.connectOnly(db)
    .then(results => {
      return new Promise (function (resolve, reject) {
        // var resObject = module.exports.decodeBarcode(req.query.barcode, false);
        asynch.eachOf(resObject, function(propertyValue, propertyKey, callback) {
          //propertyKey = propertyKey.slice(0,-2);
          //SELECT `block name` AS prop FROM `block_table` WHERE `block ID` = [yourBlockId]
          query.queryOnly(results.connection, 'SELECT `'+ propertyKey +' name` AS prop FROM `'+ propertyKey +'_table` WHERE `'+ propertyKey + ' ID` = ?', [propertyValue.id])
          .then(results => {
            if (results.data.length ==1) {
              resObject[propertyKey]['name'] = results.data[0].prop;
            }
            else {
              resObject[propertyKey]['name']='ERROR!';
              resObject.error = true;
              resObject.errorProp = propertyKey.toUpperCase();
            }
              callback();
          })
          .catch(error => {
            callback(error);
          });
        },
        function(error) {
          if (error) reject({connection: results.connection, data: error});
          else resolve({connection: results.connection});
        });
      })
    })
    .then(results => {
      results.connection.release();
      res.json(resObject);
    })
    .catch(error => {
      if (!error.getConnectionError) error.connection.release();
      res.json({error: true, message: error.data.name + ' ' + error.data.message});
      console.error(error.data);
    })
  },

  decodeBarcode : function(barcode, boolean) {
    var values = {
      block: {id: barcode.substring(0, 3)},
      variety: {id: barcode.substring(3, 5)},
      strain: {id: barcode.substring(5, 7)},
      bearing: {id: barcode.substring(7, 8)},
      treatment: {id: barcode.substring(8, 9)},
      pick: {id: barcode.substring(9, 10)},
      job: {id: barcode.substring(10, 14)}
    };
    if (boolean) values.bin = {id: barcode.substring(14, 19)};
    return values;
  },

  GetJobs: function (req, res) {
    query.standardStack(db, res, 'SELECT `Job ID` AS id, `Job Name` AS name FROM job_table', null);
  }
}
