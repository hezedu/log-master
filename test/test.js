var logMaster = require('../log-master');
logMaster.split({
  "from": {
    //"node_wechat": "D:/duwei/ycombo_wechat/other/log/2.12"
    "node_wechat": "D:/duwei/ycombo_wechat/other/log/2.2"
  },
  "Suffix":[".log",'.test'],
  "to": __dirname,
  "Interval": 1000 * 60 * 60 * 24,
  "timeFormat": "yyyy年MM月dd日HH时mm分ss秒",
  "startTime":"00:00"//开始
});