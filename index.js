//require('dotenv').config()
const fetch = require('node-fetch')
const { workflowRunner, workflowEvents } = require('./workflowRunner')
const {triggerNextTask}=require('./helper')




const splitted = process.env.parameters.split('--xxx--')
console.log('splitted',splitted)
process.env.gh_token = splitted[0]
process.env.owner = splitted[1]
process.env.idToken = splitted[2]
process.env.email = splitted[3]
process.env.localId = splitted[4]
process.env.refreshToken = splitted[5]
process.env.selectedContainer = splitted[6]
process.env.projectUrl = splitted[7]
process.env.selectedWorkspace = splitted[8]
process.env.runid = splitted[9]
process.env.start = splitted[10]
process.env.runNext=splitted[12]


const idToken = splitted[2]
const projectUrl = splitted[7]
const selectedWorkspace = splitted[8]
const taskId=splitted[11]

console.log('process.env.GITHUB_RUN_ID',process.env.GITHUB_RUN_ID)

  const fetchUrl = `${projectUrl}/server/workspaces/${selectedWorkspace}/tasks/${taskId}/.json?auth=${idToken}`
  debugger;
  fetch(fetchUrl).then(response => response.json()).then(async task => {
    debugger;
    const queque = []

    debugger;
    process.env.runSequence =task['runSequence']
      const workflows = task['workflows']
      const taskName = task['taskName']
      debugger;
      for (let wf in workflows) {
        const workflow = workflows[wf]
        queque.push({ taskId, taskName, ...workflow, workflowKey: parseInt(wf) })
      }
     const workflowRunnerEmitter = workflowRunner({ workflows: queque })
     workflowRunnerEmitter.emit(workflowEvents.START_WORKFLOW_RUNNER, {})

    if(process.env.runSequence==="parallel" && runNext==='true'){
      debugger;
       await triggerNextTask(taskId)
       debugger;
    }

  }).catch(error => {
    console.log('error', error)
    
  })








global.endTime=new Date()
setInterval(()=>{
  global.endTime.setSeconds(global.endTime.getSeconds() + 1)

},1000)









