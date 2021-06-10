var createError = require('http-errors');
var express = require('express');
var session = require('express-session');

var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')

var logger = require('morgan');
var pubstoreRouter = require('./routes/pubstore');
var indexRouter = require('./routes/index');
process.env.rootDir = path.dirname(require.main.filename);
console.log(process.env.rootDir)
var app = express();
app.use(session({
  secret: 'ASJDISDJDJJSIIFJ',
  resave: true,
  saveUninitialized:true,
  expires: new Date(Date.now() + (1000*60*60*24*2))
}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/public', function (req,res,next) {
  var today = new Date(process.env.lastModified)
  res.setHeader("Last-Modified", today.toUTCString());
  return next()
})
app.use("/public", express.static(path.join(process.env.rootDir, '/public')), function (req,res,next) {
  next()
});



app.use('/pubstore', pubstoreRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
