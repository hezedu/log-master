var logMaster = require('../log-master');

var now = new Date();
var h = now.getHours();
var m = now.getMinutes()+1;
logMaster.split({
  "from": {
/*    "nodeWeb": "/usr/local/software/node/node_web/log",
    "nodeApp": "/usr/local/software/node/node_app/log",
    "nodeWap": "/usr/local/software/node/node_wap/log",*/
    //"nodeWechat": "/usr/local/softeware/node-log-master/testtt"
    "nodeWechat": "D:/duwei/log/test"
  },
  "Suffix":[".log",'.test'],
  "to": __dirname,
  //"Interval": 1000 * 60,
  "timeFormat": "yyyy年MM月dd日HH时mm分ss秒",
  "startTime":h+':'+m//开始
});
