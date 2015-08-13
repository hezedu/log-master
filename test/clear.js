var child_process = require('child_process');
var _sh = "cat /dev/null > ";
var dir = '/usr/local/softeware/node-log-master/2015年08月13日17时56分00秒'
child_process.exec(_sh + dir+ '/nodeAdmin__node_admin_8300.log', function(err) {
  if (err) {
    console.error("清空log err:");
    console.error(err);
  }
  //cb();
});

child_process.exec(_sh + dir+'/nodeWechat__wechat_4000.log', function(err) {
  if (err) {
    console.error("清空log err:");
    console.error(err);
  }
  //cb();
});