var count = 0;
function loop(){
  setTimeout(function(){
    process.stdout.write(count + '|');
    count = count + 1;
    loop();
  },100)
}

loop();

// setTimeout(function(){
//   process.exit();
// },1000 * 30);

