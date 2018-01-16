# log-master
简单的Log定时切割工具。只作非重要log的切割。不保证log一字不差的完整性。重要的log请勿使用。
## 安装
`npm install log-master`
## 使用方法
### split

将本机上所有log用时间分割，汇集到一个文件夹里。
```javascript
var logMaster = require('log-master');
logMaster.split({ //切割，目前唯一的功能
  "from": { //源文件夹，可多选。
    "forever": "/root/.forever",
    "app1": "/app1logdir",
    "app2": "/app2logdir"
  },
  "Suffix": [".log"], //要切割的文件类型，可多选。默认 [".log"]
  "to": __dirname, //目标文件夹,log都会到这里。
  "Interval": 1000 * 60 * 60 * 24, //切割时间间隔，默认一天。
  "timeFormat": "yyyy年MM月dd日HH时mm分ss秒", //时间格式(生成的文件夹名),默认为yyyy年MM月dd日HH时mm分ss秒
  "startTime": "00:00" //开始时间，默认零点,精确到秒的话就："00:00:00"
});
```
## 运行
`nohup node youapp.js &`

或用其它守护进程比如：`pm2`, `forever`
## 注意
在window(win8.1)下测试：文件名有空格会出现日志无法清空的BUG，敬请避免使用带空格的文件名。<br>
在win10 上无法清空。<br>
所以最好不要用在**window**上。
