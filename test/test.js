var logMaster = require('../log-master');
logMaster.split({
  "from": {
    "nodeWeb": "/usr/local/software/node/node_web/log",
    "nodeApp": "/usr/local/software/node/node_app/log",
    "nodeWap": "/usr/local/software/node/node_wap/log",
    "nodeWechat": "/usr/local/software/node/nodeWechat/log"
  },
  "Suffix":[".log",'.test'],
  "to": __dirname,
  "Interval": 1000 * 60 * 60 * 24,
  "timeFormat": "yyyy年MM月dd日HH时mm分ss秒",
  "startTime":"00:00"//开始
});
