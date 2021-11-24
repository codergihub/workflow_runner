const { fbRest } = require('./firebase-rest')
debugger;
const EventEmitter = require('events');
const { runRepo } = require('./runRepo')
debugger;

const fbDatabase = fbRest().setIdToken(process.env.idToken).setProjectUri(process.env.projectUrl)
debugger;
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
       debugger;
            fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {
debugger;
                const data =Object.entries(response.data)

                process.env.AA_SAMPLE_ENV='THIS IS SAMPLE'
                data.forEach(d=>{
                    process.env[d[0]]=d[1]
               debugger;
                })
           debugger

                await runRepo({ workflow, taskEmitter: this })
            })


        })
        this.on(taskEvents.TASK_RUN_SUCCESSFUL, async function ({ taskName,
            workflowKey }) {
            const nextWorkflow = this.tasks.find(t => t.workflowKey > workflowKey)
            debugger;
            if (nextWorkflow) {
                const fbWorkflowRef = `server/workspaces/${process.env.selectedWorkspace}/tasks/${nextWorkflow.taskId}/workflows/${nextWorkflow.workflowKey}/workflowConfig/vars`
       
                fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {
    
                    const data =Object.entries(response.data)
                    data.forEach(d=>{
                        process.env[d[0]]=d[1]
                   
                    })
               
    
                    await runRepo({ workflow:nextWorkflow, taskEmitter: this })
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
                const fbWorkflowRef = `server/workspaces/${process.env.selectedWorkspace}/tasks/${nextWorkflow.taskId}/workflows/${nextWorkflow.workflowKey}/workflowConfig/vars`
       
                fbDatabase.ref(fbWorkflowRef).on('value', async (error, response) => {
    
                    const data =Object.entries(response.data)
                    data.forEach(d=>{
                        process.env[d[0]]=d[1]
                   
                    })
               
    
                    await runRepo({ workflow:nextWorkflow, taskEmitter: this })
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


