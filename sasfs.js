var sas = require('sas');
var fs = require('fs');

exports.readDir=function(path){
  return function(cb){
    fs.readdir(path,function(err,flies){
      if(err){
        return cb();
      }

    });
  }
}