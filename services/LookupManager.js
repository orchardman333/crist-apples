// Returns a single [bin's properties or employee's name] from its full tag
const db = require("./DatabaseManager");
const query = require("./QueryManager");
const asynch = require("async");

const bvsQuery = `SELECT
\`Bin ID\` AS binId,
block_table.\`Block Name\` AS blockName,
variety_table.\`Variety Name\` AS varietyName,
strain_table.\`Strain Name\` AS strainName,
\`Bushels\` AS bushels
FROM bin_table
INNER JOIN block_table ON bin_table.\`Block ID\` = block_table.\`Block ID\`
INNER JOIN variety_table ON bin_table.\`Variety ID\` = variety_table.\`Variety ID\`
INNER JOIN strain_table ON bin_table.\`Strain ID\` = strain_table.\`Strain ID\`
WHERE \`Bin ID\` = ?`
const bvsQueryString = bvsQuery.replace(/\n/g, ' ')    // Removes new-line characters

module.exports = {
  //Check if bin has entered db
  BinCheck: function(req,res) {
    query.standardStack(db, res, bvsQueryString, [req.query.binId]);
  },

  //Take bin's IDs and return full names to frontend
  BinLookup: function(req,res) {
    var resObject = {error: false, errorProp: null};
    query.connectOnly(db)
    .then(results => {
      return new Promise (function (resolve, reject) {
        var idObject = module.exports.decodeBarcode(req.query.barcode, false);
        asynch.eachOf(idObject, function(value, property, callback) {
          property = property.slice(0,-2);
          //SELECT `block name` AS prop FROM `block_table` WHERE `block ID` = [yourBlockId]
          query.queryOnly(results.connection, 'SELECT `'+ property +' Name` AS prop FROM `'+ property +'_table` WHERE `'+ property + ' ID` = ?', [value])
          .then(results => {
            if (results.data.length ==1) {
              resObject[property + 'Name'] = results.data[0].prop;
            }
            else {
              resObject[property + 'Name']='ERROR!';
              resObject.error = true;
              resObject.errorProp = property.toUpperCase();
            }
              callback();
          })
          .catch(error => {
            callback(error);
          });
        },
        function(error) {
          if (error) reject(error);
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
      blockId: barcode.substring(0, 3),
      varietyId: barcode.substring(3, 5),
      strainId: barcode.substring(5, 7),
      bearingId: barcode.substring(7, 8),
      treatmentId: barcode.substring(8, 9),
      pickId: barcode.substring(9, 10),
      jobId: barcode.substring(10, 14)
    };
    if (boolean) values.binId = barcode.substring(14, 19);
    return values;
  },

  GetJobs: function (req, res) {
    query.standardStack(db, res, 'SELECT `Job ID` AS id, `Job Name` AS name FROM job_table', null);
  }
}
