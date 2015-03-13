var child_process = require('child_process');
var conf = require('./conf');
var sas = require('./sas-debug');

var fs = require('fs');
var sasfs = require('./sas-fs');

sas.debug = 0;

var Dateformat = function(date, fmt) {

  date = date ? new Date(date) : new Date();
  fmt = fmt || 'yyyy-MM-dd HH:mm:ss';
  var o = {
    'M+': date.getMonth() + 1,
    'd+': date.getDate(),
    'H+': date.getHours(),
    'm+': date.getMinutes(),
    's+': date.getSeconds(),
    'q+': Math.floor((date.getMonth() + 3) / 3),
    'S': date.getMilliseconds()
  };
  if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
  for (var k in o)
    if (new RegExp('(' + k + ')').test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)));
  return fmt;
}


var _sh = "cat /dev/null > "; //清理log shell
var from = require('./conf').from;//源文件夹
  to = conf.to; //目标文件夹
var oldtime = conf.to + '/log-master-time'; //目标文件夹+时间
var Interval = conf.Interval; //间隔
var timeFormat = conf.timeFormat; //文件夹时间名字格式。
var Cresult = {}; //读取源文件列表变量。
var C_time = 0; //时间文件夹名字
var C_start = conf.startTime.split(':'); //开始时间
var C_start_Hour = Number(C_start[0]); //开始时间小时
var C_start_min = Number(C_start[1]); //开始时间分钟



///////////////////////////////////////////////////



var readDir = function(path) { //读取目录下log文件。第一步。
  return function(cb, t) {
    fs.readdir(path, function(err, flies) {
      if (err) {

        return cb('$STOP', err);
      }
      //var sharr = [];
      var obj = {};
      for (var i = 0, len = flies.length; i < len; i++) {
        var flie = flies[i];
        if (flie && flie[0] !== '.' && flie.substr(flie.length - 4) === '.log') {
          Cresult[path + '/' + flie] = t.index + '__' + flie;
        }
      }
      cb();
    });
  }
}


/*var readOrWrite = function(cb) { //2
  sasfs.readOrWrite({
    oldtime: Date.now()
  }, function(err, result) {
    if (err) {
      return cb('$STOP', err);
    }
    var result_time = Number(result[0].oldtime);
    var _start = new Date();
    var _now = _start.getTime();
    _start.setHours(C_start_Hour, C_start_min, 0);
    _start = _start.getTime();
    console.log("_start="+_start+" _now="+_now);
    if (_start < _now) {

      _start = _start.getTime() + Interval;
    }


    var time = Dateformat(_start, timeFormat);
    console.log('将在：\u001b[91m' + time + " \u001b[39m开始切割。");
    setTimeout(function() {
      cb(_start);
    }, _start - _now);
  });

}*/

var mkDirTime = function(cb, t) { //2跟据时间创建文件夹
  var _start = new Date();
  var _now = _start.getTime();
  _start.setHours(C_start_Hour, C_start_min, 0);

  console.log("_start=" + _start + " _now=" + _now);
  if (_start < _now) {
    _start = _start.getTime() + Interval;
  } else {
    _start = _start.getTime();
  }



//testg
  _start= _now+10;

    var time = Dateformat(_start, timeFormat);
  C_time = time;


  console.log('将在：\u001b[91m' + time + " \u001b[39m开始切割。");
  setTimeout(function() {
    console.log('正在创建文件夹:' + time);
    fs.mkdir(conf.to + '/' + time, function(err) {
      if (err) {
        console.log("创建目标文件夹失败：" + conf.to + '/' + time);
        console.log(err);
        return cb('$STOP', err);
      }

      cb();
    });
  //}, _start - _now);
  }, 10);

}


function Clear(cb, t) { //清空log;
  child_process.exec(_sh + t.pIndex, function(err) {
    if (err) {
      console.error(err);
    }
  });
}



function _loop() {





  sas([from], {
    iterator: readDir,
    allEnd: function(err, result) {
      if (err) {
        return console.log('初始化失败：' + err);
      }
      var _read = {};

      var readFile = function(cb, t) {
        fs.readFile(t.pIndex, 'utf-8', function(err, buffer) {
          if (err) {
            cb(err);
          } else {
            cb(buffer); //$THIS=  直接替换this.
          }
        });
      }

      function writeFile(cb, t) { //写入目标文件。
        console.log("t.pIndex=" + t.pIndex);
        console.log(to + "/" + C_time + '/' + Cresult[t.pIndex]);
        fs.writeFile(to + "/" + C_time + '/' + Cresult[t.pIndex], this[0], 'utf-8', function(err) {
          if (err) {
            console.log(err);
            return cb('$END');
          }
          cb();
        });
      }
      for (var i in Cresult) {
        _read[i] = [readFile, writeFile];
      }

      sas([mkDirTime, _read, function(cb) {

        cb();
        console.log('end*******************');
        _loop();
      }]);
    }
  });
}
_loop();