const EventEmitter = require('events');
const { runRepo } = require('./runRepo')
const { firebase: { fbRest } } = require('wflows')

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
        
            const fbWorkflowRef = `workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskName}/workflows/${workflow.workflowKey}/workflowConfig/vars`
       
            fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {

                const data =Object.entries(response.data)
                data.forEach(d=>{
                    process.env[d[0]]=d[1]
               
                })
           

                await runRepo({ workflow, taskEmitter: this })
            })


        })
        this.on(taskEvents.TASK_RUN_SUCCESSFUL, async function ({ taskName,
            workflowKey }) {
            const nextWorkflow = this.tasks.find(t => t.workflowKey > workflowKey)
            debugger;
            if (nextWorkflow) {
                const fbWorkflowRef = `workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskName}/workflows/${workflow.workflowKey}/workflowConfig/vars`
       
                fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {
    
                    const data =Object.entries(response.data)
                    data.forEach(d=>{
                        process.env[d[0]]=d[1]
                   
                    })
               
    
                    await runRepo({ workflow, taskEmitter: this })
                })
            } else {
                process.exit(0)
            }


            debugger;
        })
        this.on(taskEvents.TASK_RUN_FAILED, async function ({ taskName,
            workflowKey }) {
            debugger;
            const nextWorkflow = this.tasks.find(t => t.workflowKey > workflowKey)
            debugger;
            if (nextWorkflow) {
                const fbWorkflowRef = `workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskName}/workflows/${workflow.workflowKey}/workflowConfig/vars`
       
                fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {
    
                    const data =Object.entries(response.data)
                    data.forEach(d=>{
                        process.env[d[0]]=d[1]
                   
                    })
               
    
                    await runRepo({ workflow, taskEmitter: this })
                })
            } else {
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


