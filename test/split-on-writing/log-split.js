var logMaster = require('../../log-master');
logMaster.split({ //切割，目前唯一的功能
  "from": { //源文件夹，可多选。
    "loop": "/home/dw/logmaster",
  },
  "Suffix": [".log"], //要切割的文件类型，可多选。默认 [".log"]
  "to": "/home/dw/s-log", //目标文件夹,log都会到这里。
  "Interval": 1000 * 10, //切割时间间隔，默认一天。
  "timeFormat": "yyyy年MM月dd日HH时mm分ss秒", //时间格式(生成的文件夹名),默认为yyyy年MM月dd日HH时mm分ss秒
  "startTime": "00:00" //开始时间，默认零点,精确到秒的话就："00:00:00"
});

//0 4110
//