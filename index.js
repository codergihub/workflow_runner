//require('dotenv').config()
const fetch = require('node-fetch')
const { fbRest } = require('./firebase-rest')

const splitted = process.env.parameters.split('--xxx--')

process.env.gh_token = splitted[0]
process.env.owner = splitted[1]
process.env.idToken = splitted[2]
process.env.email = splitted[3]
process.env.localId = splitted[4]
process.env.refreshToken = splitted[5]
process.env.timestamp = splitted[6]
process.env.projectUrl = splitted[7]
process.env.selectedWorkspace = splitted[8]
process.env.runid = splitted[9]
process.env.start = splitted[10]
process.env.runNext = splitted[12]
process.env.runSequence = splitted[13]
process.env.taskId = splitted[11]
process.env.first = splitted[14]
process.env.wfrunid = splitted[15]
process.env.api_key = splitted[16]
const idToken = splitted[2]
const projectUrl = splitted[7]
const workspaceName = splitted[8]
const runid = splitted[9]
const taskId = splitted[11]

console.log('taskId......', taskId)
console.log('process.env.GITHUB_RUN_ID', process.env.GITHUB_RUN_ID)

if (process.env.first === 'true') {

  process.env.first = 'false'

  let totalTasks = 0
  let totalWorkflows = 0
  let start = Date.now()
  //update workspace run
  const fbDatabase = fbRest().setIdToken(process.env.idToken).setProjectUri(process.env.projectUrl)

  const tasksRef = `server/workspaces/${workspaceName}/tasks`
  //fetch workspace tasks
  fbDatabase.ref(tasksRef).get(async (error, obj) => {
    if (!error) {
      const wfPromises = []
      //count tasks
      totalTasks = Object.keys(obj).length
      for (let taskId in obj) {
        wfPromises.push((async () => {
          //fetch workflows
          const response = await fetch(`${projectUrl}/workflows/workspaces/${workspaceName}/tasks/${taskId}/.json?auth=${idToken}`, { method: 'GET' })

          const data = await response.json()

          return data
        })())

      }

      const workflows = await Promise.all(wfPromises)
      //count workflows
      workflows.forEach(wf => {
        const total = Object.keys(wf).length
        totalWorkflows = totalWorkflows + total
      })
      //save total tasks and workflow count to firebase
      const updateWsTotalTasks = { [`workspaceLogs/${workspaceName}/logs/${process.env.wfrunid}/totalTasks`]: totalTasks }
      const updateWsTotalWs = { [`workspaceLogs/${workspaceName}/logs/${process.env.wfrunid}/totalWorkflows`]: totalWorkflows }
      const updateWsStart = { [`workspaceLogs/${workspaceName}/logs/${process.env.wfrunid}/start`]: start }
      //update lastRun workspace
      const updateWsLastLogTotalTasks = { [`workspaces/${workspaceName}/lastLog/totalTasks`]: totalTasks }
      const updateWsLastLogTotalWf = { [`workspaces/${workspaceName}/lastLog/totalWorkflows`]: totalWorkflows }

      const updateWsLastLogSuccess = { [`workspaces/${workspaceName}/lastLog/success`]: 0 }
      const updateWsLastLogFailed = { [`workspaces/${workspaceName}/lastLog/failed`]: 0 }

      const response = await fetch(`${projectUrl}/.json?auth=${idToken}`, { method: 'PATCH', body: JSON.stringify({ ...updateWsTotalTasks, ...updateWsTotalWs, ...updateWsStart, ...updateWsLastLogTotalTasks, ...updateWsLastLogTotalWf, ...updateWsLastLogSuccess, ...updateWsLastLogFailed }) })
      const ok = response.ok
      //---------------------------------------------
      if (ok) {
        init({ taskId, idToken, workspaceName, projectUrl })
      } else {
        console.log('firebase error')
        throw 'firebase error'
      }

    } else {
      console.log('firenase error', error)
    }

  })


} else {

  init({ taskId, idToken, projectUrl, workspaceName })
}


global.endTime = new Date()
setInterval(() => {
  global.endTime.setSeconds(global.endTime.getSeconds() + 1)

}, 1000)



async function init({ taskId, idToken, workspaceName, projectUrl }) {
  //process.env.localId


  debugger;
  const fetchUrl = `${projectUrl}/workflows/workspaces/${workspaceName}/tasks/${taskId}/.json?auth=${idToken}`


  fetch(fetchUrl).then(response => response.json()).then(async workflows => {
    console.log('process.env.localId', process.env.localId)
    console.log('projectUrl', projectUrl)
    console.log('workspaceName', workspaceName)
    console.log('idToken', idToken)
    const googleAuthPath = `${projectUrl}/oauth/users/${process.env.localId}/workspaces/${workspaceName}/auth/google/.json?auth=${idToken}`
    const googleAuthResponse = await fetch(googleAuthPath)
    const googleAuthData = await googleAuthResponse.json()
    console.log('googleAuthData', googleAuthData)
    if (googleAuthData) {
      process.env.google_access_token = googleAuthData.access_token
      process.env.google_refresh_token = googleAuthData.refresh_token
    }

    const { workflowRunner, workflowEvents } = require('./workflowRunner')
    const queque = []

    for (let wf in workflows) {
      const workflow = workflows[wf]
      queque.push({ taskId, ...workflow, workflowKey: parseInt(wf) })

    }

    const workflowRunnerEmitter = workflowRunner({ workflows: queque })

    workflowRunnerEmitter.emit(workflowEvents.START_WORKFLOW_RUNNER, {})


    if (process.env.runSequence === "parallel" && process.env.runNext === 'true') {

      const { triggerNextTask } = require('./helper')
      //-------------------------------------------------
      await triggerNextTask(taskId)

    }

  }).catch(error => {
    console.log('error', error)

  })
}

