var child_process = require('child_process');
var sas = require('sas');
var fs = require('fs');

var Dateformat = function(date, fmt) { //来自互联网
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

exports.split = function(conf) {
  //conf
  var from = conf.from; //源文件夹
  var to = conf.to || __dirname; //目标文件夹

  var interval = conf.Interval || 
  1000 * 60 * 60 * 24; //间隔  默认一天

  var timeFormat = conf.timeFormat || "yyyy年MM月dd日HH时mm分ss秒"; //文件夹时间名字格式。

  var c_start = conf.startTime || "00:00"; //开始时间
  c_start = c_start.split(':'); //开始时间

  var suffix = conf.Suffix || 
  ['.log']; //后缀  默认['.log']

  var c_start_Hour = Number(c_start[0]); //开始时间小时
  var c_start_min = Number(c_start[1]); //开始时间分钟
  var c_start_sec = c_start[2] ? Number(c_start[2]) : 0; //开始时间秒钟
  c_start = new Date();
  c_start.setHours(c_start_Hour, c_start_min, c_start_sec);
  c_start = c_start.getTime();
  var c_result = {}; //读取源文件列表变量。
  var c_time = 0; //时间文件夹名字
  //////////////////////// task ///////////////////////////

  var readDir = function(path) { //读取目录下log文件。第一步。
    return function(cb, t) {
      fs.readdir(path, function(err, flies) {
        if (err) {
          console.error("读取目录下log文件失败:" + path);
          return cb('$STOP', err);
        }
        //var sharr = [];
        var obj = {};
        for (var i = 0, len = flies.length; i < len; i++) {
          var flie = flies[i];
          for (var suffix_i = 0, suffix_len = suffix.length; suffix_i < suffix_len; suffix_i++) {
            if (flie && flie[0] !== '.' && flie.substr(flie.length - suffix[suffix_i].length) === suffix[suffix_i]) {
              c_result[path + '/' + flie] = t.index + '__' + flie;
            }
          }
        }
        cb(path);
      });
    }
  }

  var mkDirTime = function(cb, t) { //2跟据时间创建文件夹
    var _now = Date.now();
    c_start = c_start + interval * Math.ceil((_now - c_start) / interval);
    var time = Dateformat(c_start, timeFormat);
    c_time = time;
    console.log('将在：\u001b[91m' + time + " \u001b[39m开始切割。");
    setTimeout(function() {
      console.log('正在创建文件夹:' + time);
      fs.mkdir(to + '/' + time, function(err) {
        if (err) {
          console.error("创建目标文件夹失败：" + to + '/' + time);
          return cb('$STOP', err);
        }
        cb();
      });
    }, c_start - _now);
  }


  ///////////////////// task end /////////////////////

  function _loop() {
    sas([from], {
      iterator: readDir,
      allEnd: function(err, result) {
        if (err) {
          return console.error('初始化失败：' + err);
        }
        var _catTasks = {};

        var _cat = function(cb, t) {
	        var logPath = t.index;
          var newFilePath = to + "/" + c_time + '/' + c_result[logPath]
          child_process.execSync('cat ' + logPath  + ' > ' + newFilePath + ' && cat /dev/null > ' + logPath);
	       cb();
        }
        for (var i in c_result) {
          _catTasks[i] = _cat;
        }
        sas([mkDirTime, _catTasks, function(cb) {
          cb();
          console.log('end');
          _loop();
        }]);
      }
    });
  }
  _loop();
}
