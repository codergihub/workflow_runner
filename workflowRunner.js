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
            await setEnvVars({ workflow })
            await runRepo({ workflow, workflowEmitter: this })
        })

        this.on(workflowEvents.WORKFLOW_RUN_SUCCESSFUL, async function ({ taskId,
            workflowKey }) {
            const workflow = this.workflows.find(t => t.workflowKey > workflowKey)
            if (workflow) {

                await setEnvVars({ workflow })
                await runRepo({ workflow, workflowEmitter: this })
            } else {
                //run postWorkflow
                await postTaskRun({ result: 'success' })
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
                console.log('workflows complete2....')
                process.exit(0)
            }
        })

    }
}
function workflowRunner({ workflows }) {
    const fbDatabase = fbRest().setIdToken(process.env.idToken).setProjectUri(process.env.projectUrl)
    debugger
    const promiseEmitter = new WorkFlowListender({ workflows, fbDatabase });
    promiseEmitter.fbDatabase
    promiseEmitter.setMaxListeners(50);
    return promiseEmitter;
}

async function updateTaskLog({ workflow, workflows }) {
    //update task log start
    const updateTaskUrl = `taskLogs/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/${process.env.runid}`
    const updateBody = { total: workflows.length, start: Date.now(), failed: 0, success: 0 }
    await fetch(`${process.env.projectUrl}/${updateTaskUrl}/.json?auth=${process.env.idToken}`, { method: 'PATCH', body: updateBody })
}



async function setEnvVars({ workflow }) {

    const fbWorkflowRef = `server/workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/workflows/${workflow.workflowKey}/vars`
    const response = await fetch(`${process.env.projectUrl}/${fbWorkflowRef}/.json?auth=${process.env.idToken}`, { method: 'GET' })
    if (response && response.data) {
        const { data } = response

        for (let d in data) {
            let envName = data[d]['varName']
            let envValue = data[d]['value']
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
        console.log('GITHUB_RUN_DATA', data)
    }
    var date1 = new Date(parseInt(process.env.start))
    var date2 = new Date(global.endTime.getTime())
    const { hours, mins, seconds } = timespan(date2, date1)
    const duration = `${hours}:${mins}:${seconds}`

    const updateWsLogRef = { [`workspaceLogs/${process.env.selectedWorkspace}/logs/${process.env.runid}/${result}`]: { '.sv': { 'increment': 1 } } }
    const updateTaskLogResult = { [`taskLogs/${process.env.selectedWorkspace}/tasks${process.env.taskId}/logs/${process.env.runid}/${result}`]: { '.sv': { 'increment': 1 } } }
    const updateTaskLogEnd = { [`taskLogs/${process.env.selectedWorkspace}/tasks${process.env.taskId}/logs/${process.env.runid}/end`]: Date.now() }


const updateBody = { ...updateWsLogRef, ...updateTaskLogResult, ...updateTaskLogEnd }
const response = await fetch(`${process.env.projectUrl}/.json?auth=${idToken}`, { method: 'PATCH', body: JSON.stringify(updateBody) })


if (process.env.runSequence === 'sequential' && process.env.runNext === 'true') {

    //    await triggerNextTask(taskId)
}
}

module.exports = { workflowRunner, workflowEvents }


