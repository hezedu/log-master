var child_process = require('child_process');
var conf = require('./conf');
var sas = require('./sas-debug');

var fs = require('fs');
var sasfs = require('./sas-fs');

var C_time = 0;

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
var from = conf.from, //源文件夹
  to = conf.to; //目标文件夹
var oldtime = conf.to + '/log-master-time'; //目标文件夹
var Interval = conf.Interval; //间隔
var timeFormat = conf.timeFormat; //文件夹时间格式

var Cresult = {};



/*var isDir = function(cb, t) { //是否为目录
  fs.readdir(conf.to + t.pIndex, function(err) {
    if (!err) {
      return cb('$END');
    }
    cb();
  });
}

var mkDirName = function(cb, t) { //跟据名字创建文件夹
  console.log('创建文件夹:' + t.pIndex);
  fs.mkdir(conf.to + t.pIndex, function(err) {
    if (err) {
      return cb('$STOP', err);
    }
    cb();
  });
}*/



var end = function(cb, t) { //初始化结束。
  console.log('初始化结束');
  cb('$THIS=', this[0]['OK']);
}



var ite = function(path) { //初始化集合。
  return function(cb, t) {
    var re_ = {};
    re_['OK'] = readDir(path);
    re_['/' + t.index] = [isDir, mkDirTime];
    cb('$RELOAD', [re_, end])
  }
}



var mkDirTime = function(cb, t) { //跟据时间创建文件夹
  var time = Dateformat(null, timeFormat);
  console.log('创建文件夹:' + time);
  fs.mkdir(conf.to + '/' + time, function(err) {
    if (err) {
      console.log(err)
      return cb('$STOP', err);
    }
    cb(time);
  });
}



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
          //sharr.push(flie);
        }
      }
      cb();
    });
  }
}


var readOrWrite = function(cb) { //2
  sasfs.readOrWrite({
    oldtime: Date.now()
  }, function(err, result) {
    if (err) {
      return cb('$STOP', err);
    }
    cb(result[oldtime]);
  });
}

var mkDirTime = function(cb, t) { //2跟据时间创建文件夹
  var oldtime = this[0];
  //if (Date.now() > Interval + oldtime) {
  if (1==1) {
    var time = Dateformat(null, timeFormat);
    console.log('创建文件夹:' + time);
    fs.mkdir(conf.to + '/' + time, function(err) {
      if (err) {
        console.log("conf.to + '/' + time =" + conf.to + '/' + time);
        console.log(err)
        return cb('$STOP', err);
      }
      C_time = time;
      cb();
    });
  }
}



/*function readFile(cb, t) { //读取源log 第二步
  fs.readfile(t.index, 'utf-8', function(err, buffer) {
    if (err) {
      return cb("$STOP", err);
    }
    cb(buffer);

  });
}*/



function Clear(cb, t) { //清空log;
  child_process.exec(_sh + t.pIndex, function(err) {
    if (err) {
      console.error(err);
    }
  });
}





/*var ite = function(path) { //初始化集合。
  return function(cb, t) {
    var re_ = {};
    re_['OK'] = readDir(path);
    re_['/' + t.index] = [isDir, mkDirTime];
    cb('$RELOAD', [re_, end])
  }
}*/






sas([from], {
  iterator: readDir,
  allEnd: function(err, result) {
    if (err) {
      return console.log('初始化失败：' + err);
    }
   

//return console.log(Cresult)

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
      console.log("t.pIndex=" +t.pIndex);
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
      _read[i] = [readFile, writeFile,Clear];
    }

 //console.log(result);
    sas([readOrWrite, mkDirTime, _read]);
  }
});



/*sas([readOrWrite, from], {
  iterator::ite,
    allEnd: function(err, result) {
      if (err) {
        return console.log(err);
      }
      for (var i in result) {


      }

      console.log(result);
    }
});*/