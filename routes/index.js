var express = require('express');
var router = express.Router();
var getFunc = require("../bin/gefFunc.js")
var s3connection = require("../bin/s3connection.js")
var make_stim = require("../bin/make_stimuli.js")




router.get('*', function(req,res,next) {
  if(!req.session.sona) {
    var sona = req.query.participant; // $_GET["id"]
    if(!sona) {
      return res.status(403).end("1This is not a valid URL. <br>Your session may have expired. You'll have to press the original link you used")
    }
    req.session.sona = sona
  }
  next()
})


router.get('*', function(req,res,next) {
  if(!req.session.chrome) {
    var ua = req.headers['user-agent'],
        $ = {};

    if (/chrome/i.test(ua)) req.session.chrome = true
    else req.session.chrome = false

    if(req.session.chrome)  return next()
    else return res.render('chrome', { title: 'Chrome Required'});
  }

  next()

})



router.post('/save', function (req, res) {
  var subject = req.body.subject;
  var block = req.body.block
  var data = req.body.data
  if(subject==undefined || data == undefined || block == undefined) return res.status(500).send("Something went wrong.")
  const params = {
    Bucket: 'cadseg', // pass your bucket name
    Key:  subject + "/csv/" + subject + "_block_" + block + ".json",
    Body: data
  };
  var s3 = s3connection.s3
  s3.upload(params, function(s3Err, data) {
    if (s3Err) {
      return res.status(500).send("Something went wrong.")
      console.log(s3Err)
    }
    return  res.status(200).send("File uploaded successfully")
    console.log(`File uploaded successfully at ${data.Location}`)
  });


});
router.post('/savechunk', function (req, res) {
  var subject = req.body.subject;
  var block = req.body.block
  var data = req.body.data
  var chunk = req.body.chunk
  if(subject==undefined || data == undefined || block == undefined || chunk == undefined) return res.status(500).send("Something went wrong.")
  console.log(1)
  data = JSON.parse(data)
  console.log(data,2)
  data = JSON2CSV(data);
  console.log(data,3)
  const params = {
    Bucket: 'cadseg', // pass your bucket name
    Key: subject + "/results/block_" + block + "_" + chunk +".csv", // file will be saved as testBucket/contacts.csv
    Body: data
  };
  var s3 = s3connection.s3
  s3.upload(params, function(s3Err, data) {
    if (s3Err) {
      return res.status(500).send("Something went wrong.")
      console.log(s3Err)
    }
    return  res.status(200).send("File uploaded successfully")
    console.log(`File uploaded successfully at ${data.Location}`)
  });


});



router.get('/consent', function(req, res, next) {
  res.render('consent', { title: 'Consent Form'});
})
router.get('/underage', function(req, res, next) {
  res.render('underage', { title: 'Parental Consent Form'});
})

router.get('/consented', function(req, res, next) {
  req.session.censented = true
  return res.redirect('/')
})



router.get('/', function(req, res, next) {
  if(!req.session.chrome) return res.redirect('/chrome')
  if(!req.session.censented) return res.redirect('/consent')

  let subject = "MEG_ColorP" + String(Date.now())

  //make Stimuli
  const stim = make_stim(subject)
  const params = {
    Bucket: 'cadseg', // pass your bucket name
    Key:  subject + "/csv/stimuli.json",
    Body: JSON.stringify(stim)
  };
  var s3 = s3connection.s3
  s3.upload(params, function(s3Err, data) {
    if (s3Err) {
      console.log(s3Err)
      return res.status(500).send("Something went wrong.")
    }
    var sona = req.session.sona
    res.render('index', { title: 'Experiment',subject:subject,sona:sona});
  });

});





module.exports = router;




