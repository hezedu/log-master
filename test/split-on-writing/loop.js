var count = 0;
function loop(){
  setTimeout(function(){
    process.stdout.write(count + '|');
    count = count + 1;
    loop();
  })
}

loop();

setTimeout(function(){
  process.exit();
  //30秒结束
},1000 * 30);

