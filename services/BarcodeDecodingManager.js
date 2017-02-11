//Determine type of barcode (bin, employee, etc)
//Break one full bin barcode into its separate IDs
//Input: string, Output: substrings
module.exports={
  decodeBarcode : function(barcode){
    var values = {};
    if (barcode.length == 19){
      ////this is a bin barcode
      values = {
        typeBarcode : 'bin',
        blockId: barcode.substring(0, 3),
        varietyId: barcode.substring(3, 5),
        strainId: barcode.substring(5, 7),
        bearingId: barcode.substring(7, 8),
        treatmentId: barcode.substring(8, 9),
        pickId: barcode.substring(9, 10),
        jobId: barcode.substring(10, 14),
        binId: barcode.substring(14, 19),
        idArray: [barcode.substring(0,3),barcode.substring(3,5),barcode.substring(5,7),barcode.substring(7,8),barcode.substring(8,9),barcode.substring(9,10),barcode.substring(10,14)]
      }
    }
    else if (barcode.length == 3){
      //this is an employee barcode
      values = {
        typeBarcode : 'emp',
        employeeId : barcode
      }
    }
    else {
      values = {
        typeBarcode : 'unknown'
      }
    }
    return values;
  }
}
