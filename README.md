# log-master
##split
将本机上所有log用时间分割，汇集到一个文件夹里。
```javascript
var logMaster = require('log-master');
logMaster.split({ //切割，目前唯一的功能
  "from": { //目标文件夹，可多选。
    "forever": "/root/.forever",
    "nodeApp": "/usr/local/softeware/node_app/log",
    "nodeWechat": "/usr/local/softeware/node_wechat/log"
  },
  "Suffix": [".log"], //要切割的文件类型，可多选。默认 [".log"]
  "to": __dirname + '/log', //目标文件夹
  "Interval": 1000 * 60 * 60 * 24, //切割时间间隔，默认一天。
  "timeFormat": "yyyy年MM月dd日HH时mm分ss秒", //时间格式（生成的文件夹名），默认yyyy年MM月dd日HH时mm分ss秒。
  "startTime": "00:00" //开始时间，默认零点。
});
```
