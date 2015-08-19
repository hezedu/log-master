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

var _sh = "cat /dev/null > "; //清理log shell



exports.split = function(conf) {
  //conf
  var from = conf.from; //源文件夹
  var to = conf.to || __dirname; //目标文件夹
  var Interval = conf.Interval || 1000 * 60 * 60 * 24; //间隔
  var timeFormat = conf.timeFormat || "yyyy年MM月dd日HH时mm分ss秒"; //文件夹时间名字格式。
  var C_start = conf.startTime || "00:00"; //开始时间
  C_start = C_start.split(':'); //开始时间
  var Suffix = conf.Suffix || ['.log'];

  var C_start_Hour = Number(C_start[0]); //开始时间小时
  var C_start_min = Number(C_start[1]); //开始时间分钟
  var C_start_sec = C_start[2] ? Number(C_start[2]) : 0; //开始时间分钟
  C_start = new Date();
  C_start.setHours(C_start_Hour, C_start_min, C_start_sec);
  C_start = C_start.getTime();
  var Cresult = {}; //读取源文件列表变量。
  var C_time = 0; //时间文件夹名字
  //////////////////////// task ///////////////////////////

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
          for (var Suffix_i = 0, Suffix_len = Suffix.length; Suffix_i < Suffix_len; Suffix_i++) {
            if (flie && flie[0] !== '.' && flie.substr(flie.length - Suffix[Suffix_i].length) === Suffix[Suffix_i]) {
              Cresult[path + '/' + flie] = t.index + '__' + flie;
            }
          }

        }
        cb(path);
      });
    }
  }

  var mkDirTime = function(cb, t) { //2跟据时间创建文件夹


    var _now = Date.now();

    /*    C_start.setHours(C_start_Hour, C_start_min, C_start_sec);
        C_start = C_start.getTime();*/
    /*    console.log("C_start = "+C_start);
        console.log("Interval * Math.ceil((_now - C_start) / Interval) = "+Interval * Math.ceil((_now - C_start) / Interval));*/

    /*      console.log("(_now - C_start) = " + (_now - C_start));
          console.log("Interval = " + Interval);
          console.log("(_now - C_start) / Interval) = " + (_now - C_start) / Interval);
          console.log("Math.ceil((_now - C_start) / Interval) = " + Math.ceil((_now - C_start) / Interval));
          console.log("_now = "+_now);
          console.log("C_start = "+C_start);*/

    C_start = C_start + Interval * Math.ceil((_now - C_start) / Interval);



    /*    if (C_start <= (_now + 1000)) {//如果开始时间小于 当前时间。
          C_start = C_start + Interval * Math.round((_now - C_start) / Interval);

          console.log("_now+':'+C_start.getTime()");
          console.log(_now + ':' + C_start);

        }*/
    /* else {

          C_start = C_start.getTime();

        }
    */
    //testg
    //C_start= _now+10000;

    //console.log("C_start=" + C_start + " _now=" + _now);

    var time = Dateformat(C_start, timeFormat);
    C_time = time;
    console.log('将在：\u001b[91m' + time + " \u001b[39m开始切割。");
    setTimeout(function() {
      console.log('正在创建文件夹:' + time);
      fs.mkdir(to + '/' + time, function(err) {
        if (err) {
          console.error("创建目标文件夹失败：" + to + '/' + time);
          console.error(err);
          return cb('$STOP', err);
        }
        cb();
      });
    }, C_start - _now);
    //}, 10000);

  }

  function clear(cb, t) { //清空log;
    child_process.exec(_sh + t.pIndex, function(err) {
      if (err) {
        console.error("清空log err:");
        console.error(err);
      }
      cb();
    });
  }

  ///////////////////// task end /////////////////////

  function _loop() {
    sas([from], {
      iterator: readDir,
      allEnd: function(err, result) {
        if (err) {
          return console.error('初始化失败：' + err);
        }
        var _read = {};

        var new_rw = function(cb, t) {
          var fs_rs = fs.createReadStream(t.pIndex);
          fs_rs.pipe(fs.createWriteStream(to + "/" + C_time + '/' + Cresult[t.pIndex]));
          fs_rs.on('end', function() {
            //console.log('new createReadStream');
            cb();
          });
        }
        for (var i in Cresult) {
          //_read[i] = [readFile,writeFile,Clear];
          _read[i] = [new_rw, clear];
        }
        sas([mkDirTime, _read, function(cb) {
          cb();
          console.log('end');
          _loop();
        }]);
      }
    });
  }
  _loop();
}