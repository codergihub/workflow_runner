const { fbRest } = require('./firebase-rest')

const EventEmitter = require('events');
const { runRepo } = require('./runRepo')

const { timespan } = require('./utils/timespan')
const fetch = require('node-fetch')
const { triggerNextTask } = require('./helper')


const workflowEvents = {
    START_WORKFLOW_RUNNER: 'START_WORKFLOW_RUNNER',
    WORKFLOW_RUN_SUCCESSFUL: 'WORKFLOW_RUN_SUCCESSFUL',
    WORKFLOW_RUN_FAILED: 'WORKFLOW_RUN_FAILED'
}

class WorkFlowListender extends EventEmitter {
    constructor({ workflows, fbDatabase }) {

        super()
        this.workflows = workflows
        this.on(workflowEvents.START_WORKFLOW_RUNNER, async function () {
            const workflow = this.workflows[0]
            await updateTaskLog({ workflow, workflows: this.workflows })
            await setWsEnvVars({workflow})
            await setTaskEnvVars({workflow})
            await setEnvVars({ workflow })
            await runRepo({ workflow, workflowEmitter: this })
            setInterval(()=>{
            
            },0)
        })

        this.on(workflowEvents.WORKFLOW_RUN_SUCCESSFUL, async function ({ taskId,
            workflowKey }) {
                console.log(`workflows ${workflowKey} with success....`)
            const workflow = this.workflows.find(t => t.workflowKey > workflowKey)
            if (workflow) {
                console.log(`has next....`)
                await setEnvVars({ workflow })
                await runRepo({ workflow, workflowEmitter: this })
            } else {
                //run postWorkflow
                console.log(`no next....`)
                await postTaskRun({ result: 'success' })
                console.log('workflows completed with success....')
                process.exit(0)
            }

        })

        this.on(workflowEvents.WORKFLOW_RUN_FAILED, async function ({ taskName,
            workflowKey }) {
            const workflow = this.workflows.find(t => t.workflowKey > workflowKey)
            if (workflow) {
                await setEnvVars({ workflow })
                await runRepo({ workflow, workflowEmitter: this })
            } else {
                //run postWorkflow
                await postTaskRun({ result: 'failed' })
                console.log('workflows completed with error....')
                process.exit(1)
            }
        })

    }
}
function workflowRunner({ workflows }) {
    const fbDatabase = fbRest().setIdToken(process.env.idToken).setProjectUri(process.env.projectUrl)

    const promiseEmitter = new WorkFlowListender({ workflows, fbDatabase });
    promiseEmitter.fbDatabase
    promiseEmitter.setMaxListeners(50);
    return promiseEmitter;
}

async function updateTaskLog({ workflow, workflows }) {
    const currentDate =Date.now()
    //update task log start
    const updateTaskTotal = {[`taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${workflow.taskId}/log/total`]:workflows.length}
    const updateTaskStart = {[`taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${workflow.taskId}/log/start`]:currentDate}
    const updateTaskFailed = {[`taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${workflow.taskId}/log/failed`]:0}
    const updateTaskSuccess = {[`taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${workflow.taskId}/log/success`]:0}
  //UPDATE task lastLog
  const updateTaskLastLogTotal = {[`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/total`]:workflows.length}
  const updateTaskLastLogStart = {[`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/start`]:currentDate}
  const updateTaskLastLogFailed = {[`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/failed`]:0}
  const updateTaskLastLogSuccess = {[`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/success`]:0}


    const response = await fetch(`${process.env.projectUrl}/.json?auth=${process.env.idToken}`, { method: 'PATCH', body: JSON.stringify({
        ...updateTaskTotal,...updateTaskStart,...updateTaskFailed,...updateTaskSuccess,...updateTaskLastLogTotal,...updateTaskLastLogStart,...updateTaskLastLogFailed,...updateTaskLastLogSuccess}) })
    
}

async function setEnvVars({ workflow }) {

    const fbWorkflowRef = `vars/workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/workflows/${workflow.workflowKey}/vars`
    const response = await fetch(`${process.env.projectUrl}/${fbWorkflowRef}/.json?auth=${process.env.idToken}`, { method: 'GET' })
    const data =await response.json()
    
    if (data) {
     
        for (let d in data) {
            let envName = data[d]['inputName']
            let envValue = data[d]['value']
            
            process.env[envName] = envValue
        }

    }

}

async function setWsEnvVars({ workflow }){
    const fbWorkflowRef = `vars/workspaces/${process.env.selectedWorkspace}/vars`
    const response = await fetch(`${process.env.projectUrl}/${fbWorkflowRef}/.json?auth=${process.env.idToken}`, { method: 'GET' })
    const data =await response.json()
    
    if (data) {
      

        for (let d in data) {
            let envName = data[d]['varName']
            let envValue = data[d]['varValue']
            process.env[envName] = envValue
            
        }

    }
}

async function setTaskEnvVars({ workflow }){
    const fbWorkflowRef = `vars/workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/vars`
    const response = await fetch(`${process.env.projectUrl}/${fbWorkflowRef}/.json?auth=${process.env.idToken}`, { method: 'GET' })
    const data =await response.json()
    if (data) {


        for (let d in data) {
            let envName = data[d]['varName']
            let envValue = data[d]['varValue']
            process.env[envName] = envValue
        }

    }
}

async function postTaskRun({ result }) {
    let html_url = ''
    if (process.env.GITHUB_RUN_ID) {
        const fetchPath = `https://api.github.com/repos/${process.env.owner}/workflow_runner/actions/runs/${process.env.GITHUB_RUN_ID}`

        const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${process.env.gh_token}` } })
        const data = await response.json()
        html_url = data.html_url
       // console.log('GITHUB_RUN_DATA', data)
    }
    var date1 = new Date(parseInt(process.env.start))
    var date2 = new Date(global.endTime.getTime())
    const { hours, mins, seconds } = timespan(date2, date1)
    const duration = `${hours}:${mins}:${seconds}`

const currentDate =Date.now()
    const updateWsLastTaskLogRef = { [`workspaceLogs/${process.env.selectedWorkspace}/logs/${process.env.wfrunid}/last`]: currentDate }
    const updateTaskLogEnd = { [`taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${process.env.taskId}/log/end`]: currentDate }

    //update workspace lastLog
    const updateWsLastLogTotalTasks ={[`workspaces/${process.env.selectedWorkspace}/lastLog/last`]:currentDate}
    //update task lastLog
    const updateTaskLastLogEnd = { [`workspaces/${process.env.selectedWorkspace}/tasks/${process.env.taskId}/lastLog/end`]: currentDate }
    

    const updateBody = {...updateTaskLogEnd,...updateWsLastTaskLogRef,...updateWsLastLogTotalTasks,...updateTaskLastLogEnd }

    const response = await fetch(`${process.env.projectUrl}/.json?auth=${process.env.idToken}`, { method: 'PATCH', body: JSON.stringify(updateBody) })
    const ok = response.ok
    

    if (process.env.runSequence === 'sequential' && process.env.runNext === 'true') {
        
        await triggerNextTask(process.env.taskId)
    }
}

module.exports = { workflowRunner, workflowEvents }


