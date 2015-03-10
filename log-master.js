var child_process = require('child_process');
var conf = require('./conf');
var sas = require('sas');
var fs = require('fs');

//cat /dev/null > /root/.forever/QP2l.log


var from = conf.from,
  to = conf.to;
var start = new Date();

var isDir = function(cb,t) {
  fs.readdir(conf.to + t.pIndex, function(err) {
    if (!err) {
      return cb('$END');
    }
    cb();
  });
}

var mkDir = function(cb,t) {
  console.log('创建文件夹:'+t.pIndex);
  fs.mkdir(conf.to + t.pIndex, function(err) {
    if (err) {
      return cb('$STOP', err);
    }
    cb();
  });
}

var readDir = function(path) {
  return function(cb) {
    fs.readdir(path, function(err,flies) {
      if (err) {
        return cb('$STOP',err);
      }
      var sharr = [];
      for (var i = 0, len = flies.length; i < len; i++) {
        var flie = flies[i];
        if (flie && flie[0] !== '.' && flie.substr(flie.length - 4) === '.log') {
          sharr.push(flie);
        }
      }
      cb(sharr);
    });
  }
}

var end = function(cb,t) {
  cb('$THIS=', this[0]['OK']);
}

var ite = function(path) {
  return function(cb,t) {
    var re_={};
    re_['OK']=readDir(path);
    re_['/'+t.index]=[isDir, mkDir];
    cb('$RELOAD', [re_, end])
  }
}



sas([from], {
  iterator: ite,
  allEnd: function(err, result) {
    if (err) {
      return console.log(err);
    }
    
    for(var i in result){
      to+i
    }

    console.log(result);
  }
});