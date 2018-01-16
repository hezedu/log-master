

var express = require('express');
var path = require('path');


var app = express();

var count = 0;
function loop(){
  setTimeout(function(){
    process.stdout.write(count + '|');
    count = count + 1;
    loop();
  })
}

loop();
/*
setTimeout(function(){
	process.exit();
},1000 * 30);
*/
// view engine setup

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('tiny'));
app.use(express.static(path.join(__dirname, 'public')));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
