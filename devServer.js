require('dotenv').config()

const { Worker } = require("worker_threads");
const http = require('http');


const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://localhost:8888');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')
  let data = [];

  switch (req.method) {
    case "OPTIONS":
      res.statusCode = 200
      res.end();
      break;
    case "POST":

      req.on("data", (chunk) => {
        data.push(chunk);
      });
      req.on("end", async () => {
        if (data.length > 0) {
          const body = JSON.parse(data);
          const { inputs: { projectName, parameters } } = body
          process.env.parameters = parameters
          
       
          const main = `${__dirname}/index.js`

          const worker = new Worker(main, { workerData: {} });

          worker.once("message", result => {
            console.log(`${number}th Fibonacci No: ${result}`);
          });

          worker.on("error", error => {
            console.log(`DevServer exited with error`, error);

          });

          worker.on("exit", exitCode => {
            console.log(`DevServer exited with code ${exitCode}`);
            

          })
        }
      });
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/plain');
      res.end('local workflow triggered')
      break;
    default:
      res.setHeader('Content-Type', 'text/plain');
      res.end('Unhandled method')
  }


})
server.listen(3001, () => {
  console.log(`LOCAL workflow server running on port ${3001}`);
});