var child_process = require('child_process');
var conf = require('./conf');
var sas = require('sas');

var fs = require('fs');
var sasfs = require('sas-fs');



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

          obj[path + '/' + flie] = t.index + '__' + flie;
          //sharr.push(flie);
        }
      }
      cb(obj);
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
  if (Date.now() > Interval + oldtime) {
    var time = Dateformat(null, timeFormat);
    console.log('创建文件夹:' + time);
    fs.mkdir(conf.to + '/' + time, function(err) {
      if (err) {
        return cb('$STOP', err);
      }
      cb(conf.to + '/' + time);
    });
  }
}



var readFile = function(cb, t) {
  fs.readFile(t.index, 'utf-8', function(err, buffer) {
    if (err) {
      cb(err);
    } else {
      cb(buffer); //$THIS=  直接替换this.
    }
  });
}

/*function readFile(cb, t) { //读取源log 第二步
  fs.readfile(t.index, 'utf-8', function(err, buffer) {
    if (err) {
      return cb("$STOP", err);
    }
    cb(buffer);

  });
}*/

function writeFile(cb, t) { //写入目标文件。
  fs.writefile(t.Sparent[1]+'/'+t.index, this[0], 'utf-8', function(err) {
    if (err) {
      console.error(err);
      return cb('$END');
    }
    cb();
  });
}

function Clear(cb, t) { //清空log;
  child_process.exec(_sh + t.index, function(err) {
    if (err) {
      console.error(err);
    }
  });
}

var iterator = function(path) {
  return function(cb, t) {

  }
}



/*var ite = function(path) { //初始化集合。
  return function(cb, t) {
    var re_ = {};
    re_['OK'] = readDir(path);
    re_['/' + t.index] = [isDir, mkDirTime];
    cb('$RELOAD', [re_, end])
  }
}*/

var loop = function(cb) {

  cb('$RELOAD', [readOrWrite, mkDirTime, readFile, writeFile, Clear]);

}



/*{
  "one": readDir,
  "two": [readOrWrite, mkDirTime]
},
"three":*/

sas([from], {
  iterator: readDir,
  allEnd: function(err, result) {
    if (err) {
      return console.error('初始化失败：' + err);
    }
    var _read = {},
      _write = {};
    for (var i in result) {
      _read[i] = readFile;
      _write[result[i]] = '';
    }
    _write
  }
});



sas([readOrWrite, from], {
  iterator::ite,
    allEnd: function(err, result) {
      if (err) {
        return console.log(err);
      }
      for (var i in result) {


      }

      console.log(result);
    }
});