var express = require('express');
var router = express.Router();
var getFunc = require("../bin/gefFunc.js")
var s3connection = require("../bin/s3connection.js")

var JSON2CSV = function () {
    const items = json3.items
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')

    console.log(csv)
}


/* GET home page. */
router.get('/*', function (req,res,next){
    //get extension
    var re = /(?:\.([^.]+))?$/;
    var ext = re.exec(req.url)[1];
    if (ext == undefined) return res.status(404).send('File not found')

    //get info before querystring if one exists
    if (req.url.indexOf('?') != -1) {
        var path = req.url.split('?')[0]
    }
    else {
        var path = req.url
    }
    console.log(path)

    var s3 = s3connection.s3


    var params = {Bucket: 'cadseg', Key: path.substring(1)};
    s3.getObject(params).createReadStream().on('error', function(err){
        return res.status(err.statusCode).end(err.message)
        console.log(err);
    }).pipe(res)
})


module.exports = router;
