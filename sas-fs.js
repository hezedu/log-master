var fs = require('fs');
var sas = require('./sas-debug');

/*
 * Read or Create 常见的场景
 *同时读取三个文件，如没有就创建一个新的,并写入一些初始数据。
 */

exports.readFile = function(pathData, cb) {


  function readFile(cb, t) {
    fs.readFile(t.index, 'utf-8', function(err, buffer) {
      if (err) {
        cb(err);
      } else {
        cb(buffer); //$THIS=  直接替换this.
      }
    });
  }

  
}

exports.readOrWrite = function(pathData, cb) {

  //var dir = __dirname + '/data'; //要读取的目录
  //var initData = 'hello'; //初始化的数据。

  function readFile(cb, t) {
    var path = t.pIndex;
    fs.readFile(path, null, function(err, buffer) {
      if (err) {
        cb();
      } else {
        cb('$THIS=', buffer.toString()); //$THIS=  直接替换this.
      }
    });
  }

  function createFile(cb, t) {
    var path = t.pIndex;
    fs.writeFile(path, pathData[path], null, function(err) {
      if (err) {
        console.log('createFile err:' + err);
        cb('$STOP'); //错误就中止sas
      } else {
        console.log('创建文件：' + path);
        cb('$THIS=', pathData[path]);
      }
    });
  }

  var taskobj = {};
  for (var i in pathData) {
    taskobj[i] = [readFile, createFile];
  }

  sas([taskobj], {
    allEnd: cb
  });
}

/*test({
  './readOrCreate1.txt': '[readFile, createFile]',
  './readOrCreate2.txt': '222[readFile, createFile]',
  './readOrCreate3.txt': '222[readFile, createFile]'
}, function(err, result) {
  console.log(result);
})*/