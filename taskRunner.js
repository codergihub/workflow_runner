const EventEmitter = require('events');
const { runRepo } = require('./runRepo')
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

            await runRepo({ workflow, taskEmitter: this })

            debugger;
        })
        this.on(taskEvents.TASK_RUN_SUCCESSFUL, async function ({ taskName,
            workflowKey }) {
            const nextWorkflow = this.tasks.find(t => t.workflowKey > workflowKey)
            debugger;
            if(nextWorkflow){
                await runRepo({ workflow: nextWorkflow, taskEmitter: this })
            }
          

            debugger;
        })
        this.on(taskEvents.TASK_RUN_FAILED, ({ taskName,
            workflowKey }) => {
            debugger;
        })

    }
}
function taskRunner({ tasks }) {
    const promiseEmitter = new TaskListender({ tasks });
    promiseEmitter.setMaxListeners(50);
    return promiseEmitter;
}


module.exports = { taskRunner, taskEvents }


