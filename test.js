var sas = require('sas');
var fs = require('fs');

exports.exists=function(path){
  return function(cb){
    fs.exists(path,function(err){
      if(err){
        cb();
      }else{
        cb('$END');
      }
    });
  }
}

function(cb,t){

}