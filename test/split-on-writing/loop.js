var count = 0;
function loop(){
  setTimeout(function(){
    console.log(count + '|');
    count = count + 1;
    loop();
  })
}

loop();

setTimeout(function(){
  process.exit();
},1000 * 30);

