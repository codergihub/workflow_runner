const { fbRest } = require('./firebase-rest')

const EventEmitter = require('events');
const { runRepo } = require('./runRepo')
const { timespan } = require('./utils/timespan')
const fetch = require('node-fetch')
const fbDatabase = fbRest().setIdToken(process.env.idToken).setProjectUri(process.env.projectUrl)

/*

  process.env.gh_token = splitted[0]
  process.env.owner = splitted[1]
  process.env.idToken = splitted[2]
  process.env.email = splitted[3]
  process.env.localId = splitted[4]
  process.env.refreshToken = splitted[5]
  process.env.selectedContainer = splitted[6]
  process.env.projectUrl = splitted[7]
  process.env.selectedWorkspace = splitted[8]
*/

const taskEvents = {
    START_TASK_RUNNER: 'START_TASK_RUNNER',
    TASK_RUN_SUCCESSFUL: 'TASK_RUN_SUCCESSFUL',
    TASK_RUN_FAILED: 'TASK_RUN_FAILED'
}

class TaskListender extends EventEmitter {
    constructor({ tasks }) {
        super()
        this.tasks = tasks
        this.on(taskEvents.START_TASK_RUNNER, async function () {
            const workflow = this.tasks[0]

            const fbWorkflowRef = `server/workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/workflows/${workflow.workflowKey}/workflowConfig/vars`

            fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {

                const data = Object.entries(response.data)

                process.env.AA_SAMPLE_ENV = 'THIS IS SAMPLE'
                data.forEach(d => {
                    process.env[d[0]] = d[1]

                })
                debugger

                await runRepo({ workflow, taskEmitter: this })
            })


        })
        this.on(taskEvents.TASK_RUN_SUCCESSFUL, async function ({ taskName,
            workflowKey }) {
            const nextWorkflow = this.tasks.find(t => t.workflowKey > workflowKey)

            if (nextWorkflow) {
                debugger;
                const fbWorkflowRef = `server/workspaces/${process.env.selectedWorkspace}/tasks/${nextWorkflow.taskId}/workflows/${nextWorkflow.workflowKey}/workflowConfig/vars`

                fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {
                    debugger;
                    const data = Object.entries(response.data)
                    debugger;
                    data.forEach(d => {
                        process.env[d[0]] = d[1]

                    })


                    await runRepo({ workflow: nextWorkflow, taskEmitter: this })
                })
            } else {
                try {
                    if(process.env.GITHUB_RUN_ID){
                        const fetchPath = `https://api.github.com/repos/${process.env.owner}/workflow_runner/actions/${process.env.GITHUB_RUN_ID}`

                        const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${ process.env.gh_token}` } })
                        const data = await response.json()
                        console.log('GITHUB_RUN_DATA',data)
                    }
                    var date1 = new Date(parseInt(process.env.start))
                    var date2 = new Date(global.endTime.getTime())
                    const { hours, mins, seconds } = timespan(date2, date1)
                    const duration = `${hours}:${mins}:${seconds}`
                    const start =parseInt(process.env.start)
                    const update = { [`runs/${process.env.selectedWorkspace}/${process.env.runid}`]: { runState: 2, duration, end: global.endTime.getTime(), start } }
                    fbDatabase.ref('/').update(update, async (error, data) => {
                        debugger;
                        console.log('Tasks complete1....')
                        process.exit(0)

                    })


                } catch (error) {
                    console.log('error', error)
                }

                debugger;

            }



        })
        this.on(taskEvents.TASK_RUN_FAILED, async function ({ taskName,
            workflowKey }) {

            const nextWorkflow = this.tasks.find(t => t.workflowKey > workflowKey)

            if (nextWorkflow) {
                const fbWorkflowRef = `server/workspaces/${process.env.selectedWorkspace}/tasks/${nextWorkflow.taskId}/workflows/${nextWorkflow.workflowKey}/workflowConfig/vars`

                fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {

                    const data = Object.entries(response.data)
                    data.forEach(d => {
                        process.env[d[0]] = d[1]

                    })


                    await runRepo({ workflow: nextWorkflow, taskEmitter: this })
                })
            } else {
                console.log('Tasks complete2....')
                process.exit(0)
            }
        })

    }
}
function taskRunner({ tasks }) {
    const promiseEmitter = new TaskListender({ tasks });
    promiseEmitter.setMaxListeners(50);
    return promiseEmitter;
}


module.exports = { taskRunner, taskEvents }


