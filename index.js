var exec = require('child_process').exec
debugger;
const packages='dotenv dotenv-expand'
var cmd = exec(`npm i ${packages}`, function(err, stdout, stderr) {
    if (err) {
        debugger;
      // handle error
    } 
    else{

        debugger;
    
    }
    console.log(stdout);
  });
  
console.log("index.js run....",process.env.parameters)
