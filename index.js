require('dotenv').config()
const fetch = require('node-fetch')
const fs = require('fs')
const makeDir = require('make-dir');
const pather = require('path')

const { taskRunner, taskEvents } = require('./taskRunner')
var exec = require('child_process').exec

var gh_token = ''
var owner = ''
var idToken = ''
var email = ''
var localId = ''
var refreshToken = ''
var selectedContainer = ''
var selectedWorkspace = ''
var projectUrl = ''
var filterComplete = ''
//var workflowPath = ''
if (process.env.LOCAL === 'true') {
  gh_token = process.env.token
  owner = process.env.owner
  idToken = process.env.idToken
  email = process.env.email
  localId = process.env.localId
  refreshToken = process.env.refreshToken
  selectedContainer = process.env.selectedContainer
  projectUrl = process.env.projectUrl
  selectedWorkspace = process.env.selectedWorkspace
  //workflowPath = process.env.workflowPath

} else {

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
  // workflowPath = splitted[9]


}
const data = {
  "Task 1": {
    taskorder: "1",
    workflows: {
      "1635152857846": {
        isPrivate: false,
        screenName: "codergihub",
        selectedBranch: "main",
        selectedRepo: "books",
        tokenFPR: "",
        workflowDescription: "w",
        workflowName: "codergihub_books_main",
        workflowOrder: "1",
      },
      "1635153062412": {
        isPrivate: false,
        screenName: "codergihub",
        selectedBranch: "main",
        selectedRepo: "books",
        tokenFPR: "",
        workflowDescription: "k/jeans",
        workflowName: "codergihub_books_main",
        workflowOrder: "2",
      },
    },
  },
  "Task 2": {
    taskorder: "2",
    workflows: {
      "1635220515391": {
        isPrivate: false,
        screenName: "codergihub",
        selectedBranch: "main",
        selectedRepo: "defacto",
        tokenFPR: "",
        workflowDescription: "d",
        workflowName: "codergihub_defacto_main",
        workflowOrder: "1",
      },
    },
  },
}
//1.get workflows info from firebase

const fetchUrl = `${projectUrl}/workspaces/${selectedWorkspace}/tasks/.json?auth=${idToken}`
debugger;
fetch(fetchUrl).then(response => response.json()).then(data => {
  const queque = []
  const tasks = Object.entries(data)
  debugger;
  tasks.forEach(task => {
    const taskName = task[0]
    const taskOrder = task[1]['taskorder']
  
    const workflows = task[1]['workflows']
    for (let wf in workflows) {
      const workflow = workflows[wf]
      debugger;
      queque.push({ taskName, taskOrder, ...workflow,workflowKey:parseInt(wf) })
  
    }
   
  
  })
  const taskRunnerEmitter = taskRunner({ tasks: queque })
  taskRunnerEmitter.emit(taskEvents.START_TASK_RUNNER, {})
}).catch(error => {
  debugger;
})






