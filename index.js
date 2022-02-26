//require('dotenv').config()
const fetch = require('node-fetch')
const { workflowRunner, workflowEvents } = require('./workflowRunner')
const {triggerNextTask}=require('./helper')




const splitted = process.env.parameters.split('--xxx--')

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
process.env.runSequence =splitted[13]

const idToken = splitted[2]
const projectUrl = splitted[7]
const workspaceName = splitted[8]
const taskId=splitted[11]
console.log('taskId......',taskId)
console.log('process.env.GITHUB_RUN_ID',process.env.GITHUB_RUN_ID)

  const fetchUrl = `${projectUrl}/workflows/workspaces/${workspaceName}/tasks/${taskId}/.json?auth=${idToken}`
  
  fetch(fetchUrl).then(response => response.json()).then(async workflows => {
    
    const queque = []
      
      for (let wf in workflows) {
        const workflow = workflows[wf]
        queque.push({ taskId, ...workflow, workflowKey: parseInt(wf) })
        
      }
      
     const workflowRunnerEmitter = workflowRunner({ workflows: queque })
     
     workflowRunnerEmitter.emit(workflowEvents.START_WORKFLOW_RUNNER, {})
debugger;
    if(process.env.runSequence==="parallel" && process.env.runNext==='true'){
      //-------------------------------------------------
    //   await triggerNextTask(taskId)
       
    }

  }).catch(error => {
    console.log('error', error)
    
  })








global.endTime=new Date()
setInterval(()=>{
  global.endTime.setSeconds(global.endTime.getSeconds() + 1)

},1000)









