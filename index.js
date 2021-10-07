var exec = require('child_process').exec
debugger;
const packages='dotenv dotenv-expand'
// var cmd = exec(`npm i ${packages}`, function(err, stdout, stderr) {
//     if (err) {
//         debugger;
//       // handle error
//     } 
//     else{

//         debugger;
    
//     }
//     console.log(stdout);
//   });
const splitted=process.env.parameters.split('--xxx--')
const gh_token =splitted[0]
const owner =splitted[1]
const idToken=splitted[2]
const email=splitted[3]
const localId=splitted[4]
const refreshToken=splitted[5]
const selectedContainer=splitted[6]
const projectUrl=splitted[7]

const paramObject ={gh_token,owner,idToken,email,localId,refreshToken,selectedContainer,projectUrl}

console.log("parameter string",process.env.parameters.split('--xxx--'))
console.log("parameter object",paramObject)