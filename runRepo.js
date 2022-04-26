const fetch = require('node-fetch')
const { Worker } = require("worker_threads");
const { fbRest } = require('wflows')
const fs = require('fs')
const makeDir = require('make-dir');
const pather = require('path')
const fbDatabase = fbRest()
const { timespan } = require('./utils/timespan')
const {triggerNextTask}=require('./helper')
var exec = require('child_process').execSync
async function runRepo({ workflow }) {

    const { screenName,
        repoName,
        taskId,
        selectedBranch,
        workflowKey } = workflow


    const gh_token = process.env.gh_token

    //1.GET CONTENTS FROM WORKFLOW REPO
    const tree = await getWorkflowSourceCodeTree({ owner: screenName, repoName, token: gh_token, selectedBranch })

    const contents = await getContentsFromWorkflowRepo({ owner: screenName, repoName, tree, token: gh_token })
    //2.SAVE CONTENT TO ROOT FOLDER

    for (let c of contents) {
        const { content, path } = c
        const utfContent = Buffer.from(content, 'base64').toString('utf-8')

        const filepath = `${process.cwd()}/${repoName}/${path}`
        const dirpath = pather.dirname(filepath)
        makeDir.sync(dirpath)
        fs.writeFileSync(filepath, utfContent)

    }


    //3.INSTALL DEPENDENECIES

    let dependencyArray = []
    let dependencies = ''


    const { dependencies: originalDependencies } = require(`${process.cwd()}/${repoName}/package.json`)


    for (let obj in originalDependencies) {
        const value = originalDependencies[obj].replace('^', '')
        dependencyArray.push(`${obj}@${value}`)
    }
    dependencies = dependencyArray.join(' ')

    console.log('dependencies....', dependencies)
    //npm i ${dependencies}
    //process.env.LOCAL === 'true' ? `echo 'local dev....'` : 
    debugger;
    var cmd = exec(process.env.LOCAL === 'true' ? `echo 'local dev....'` : `npm install ${dependencies}`)//, async function (err, stdout, stderr) {


    console.log('dependencies installed')
    const currentDate = Date.now()
    const updateWfLogRef = { [`workflowLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${taskId}/workflows/${workflowKey}/log/start`]: currentDate }

    const updateWfLastLogStart = { [`workflows/workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/${workflowKey}/lastLog`]: { start: currentDate, end: null, result: null } }
    await fbDatabase.ref("/").update({ ...updateWfLogRef, ...updateWfLastLogStart })

    const main = `${process.cwd()}/${repoName}/main.js`

    await updateTaskLog({ workflow, workflows: this.workflows })
    debugger;
    await setWsEnvVars({ workflow })
    await setTaskEnvVars({ workflow })
    await setEnvVars({ workflow })
    debugger;
    const worker = new Worker(main, { workerData: {} });
    debugger;
    worker.once("message", result => {
        console.log(`${number}th Fibonacci No: ${result}`);
    });

    worker.on("error", async error => {
        const currentDate = Date.now()
        const updateWsLogRef = `workspaceLogs/${process.env.selectedWorkspace}/logs/${process.env.wfrunid}/failed`
        const updateTaskLogRef = `taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${process.env.taskId}/log/failed`
        const updateWfResultLogRef = `workflowLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${taskId}/workflows/${workflowKey}/log/result`
        const updateWfEndLogRef = `workflowLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${taskId}/workflows/${workflowKey}/log/end`
        //update workflow lastRun
        const updateWfLastLogEnd = `workflows/workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/${workflowKey}/lastLog/end`
        const updateWfLastLogResult = `workflows/workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/${workflowKey}/lastLog/result`
        //update lastRun workspace
        const updateWsLastLogTotalTasks = `workspaces/${process.env.selectedWorkspace}/lastLog/failed`
        //update lastRun task
        const updateTaskLastLogTotalTasks = `workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/lastLog/failed`
        const update = {
            [updateWfResultLogRef]: 'failed',
            [updateWfLastLogResult]: 'failed',
            [updateWfEndLogRef]: currentDate,
            [updateWfLastLogEnd]: currentDate,
            [updateWsLogRef]: { '.sv': { 'increment': 1 } },
            [updateTaskLogRef]: { '.sv': { 'increment': 1 } },
            [updateWsLastLogTotalTasks]: { '.sv': { 'increment': 1 } },
            [updateTaskLastLogTotalTasks]: { '.sv': { 'increment': 1 } }
        }
        console.log(`workflow run error ${error}`);
        await fbDatabase.ref('/').update(update)
        await postTaskRun({ result: 'failed' })

        //   workflowEmitter.emit("WORKFLOW_RUN_FAILED", { taskId, workflowKey,error })
        debugger;

        process.exit(1)




    });

    worker.on("exit", async exitCode => {
        if (exitCode === 0) {
            const currentDate = Date.now()
            const updateWsLogRef = `workspaceLogs/${process.env.selectedWorkspace}/logs/${process.env.wfrunid}/success`
            const updateTaskLogRef = `taskLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${process.env.taskId}/log/success`
            const updateWfResultLogRef = `workflowLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${taskId}/workflows/${workflowKey}/log/result`
            const updateWfEndLogRef = `workflowLogs/${process.env.selectedWorkspace}/${process.env.wfrunid}/tasks/${taskId}/workflows/${workflowKey}/log/end`

            //update workflow lastRun
            const updateWfLastLogEnd = `workflows/workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/${workflowKey}/lastLog/end`
            const updateWfLastLogResult = `workflows/workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/${workflowKey}/lastLog/result`
            //
            const updateWsLastLogTotalTasks = `workspaces/${process.env.selectedWorkspace}/lastLog/success`
            //update lastRun task
            const updateTaskLastLogTotalTasks = `workspaces/${process.env.selectedWorkspace}/tasks/${taskId}/lastLog/success`
            const update = {
                [updateWfResultLogRef]: 'success',
                [updateWfLastLogResult]: 'success',
                [updateWfEndLogRef]: currentDate,
                [updateWfLastLogEnd]: currentDate,
                [updateWsLogRef]: { '.sv': { 'increment': 1 } },
                [updateTaskLogRef]: { '.sv': { 'increment': 1 } },
                [updateWsLastLogTotalTasks]: { '.sv': { 'increment': 1 } },
                [updateTaskLastLogTotalTasks]: { '.sv': { 'increment': 1 } }
            }
            debugger;
            await fbDatabase.ref('/').update(update)
            await postTaskRun({ result: 'success' })
            debugger;

            process.exit(0)



        }




    })






}//runRepo

async function updateTaskLog({ workflow, workflows }) {
    const currentDate = Date.now()
    //update task log start

    //UPDATE task lastLog
    const updateTaskLastLogTotal = { [`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/total`]: 1 }
    const updateTaskLastLogStart = { [`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/start`]: currentDate }
    const updateTaskLastLogFailed = { [`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/failed`]: 0 }
    const updateTaskLastLogSuccess = { [`workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/lastLog/success`]: 0 }

    await fbDatabase.ref("/").update({ ...updateTaskLastLogTotal, ...updateTaskLastLogStart, ...updateTaskLastLogFailed, ...updateTaskLastLogSuccess })
}

async function setEnvVars({ workflow }) {

    const fbWorkflowRef = `vars/workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/workflows/${workflow.workflowKey}/vars`
    const data = await fbDatabase.ref(fbWorkflowRef).get()


    if (data) {

        for (let d in data) {
            let envName = data[d]['inputName']
            let envValue = data[d]['value']

            process.env[envName] = envValue
        }

    }

}

async function setWsEnvVars({ workflow }) {
    const fbWorkflowRef = `vars/workspaces/${process.env.selectedWorkspace}/vars`
    const data = await fbDatabase.ref(fbWorkflowRef).get()


    if (data) {


        for (let d in data) {
            let envName = data[d]['varName']
            let envValue = data[d]['varValue']
            process.env[envName] = envValue

        }

    }
}

async function setTaskEnvVars({ workflow }) {
    const fbWorkflowRef = `vars/workspaces/${process.env.selectedWorkspace}/tasks/${workflow.taskId}/vars`
    const data = await fbDatabase.ref(fbWorkflowRef).get()

    if (data) {


        for (let d in data) {
            let envName = data[d]['varName']
            let envValue = data[d]['varValue']
            process.env[envName] = envValue
        }

    }
}

async function postTaskRun() {
    let html_url = ''
    if (process.env.GITHUB_RUN_ID) {
        const fetchPath = `https://api.github.com/repos/${process.env.owner}/workflow_runner/actions/runs/${process.env.GITHUB_RUN_ID}`

        const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${process.env.gh_token}` } })
        const data = await response.json()
        html_url = data.html_url

    }
    var date1 = new Date(parseInt(process.env.start))
    var date2 = new Date(global.endTime.getTime())
    const { hours, mins, seconds } = timespan(date2, date1)
    const duration = `${hours}:${mins}:${seconds}`

    const currentDate = Date.now()


    //update workspace lastLog
    const updateWsLastLogTotalTasks = { [`workspaces/${process.env.selectedWorkspace}/lastLog/last`]: currentDate }
    //update task lastLog
    const updateTaskLastLogEnd = { [`workspaces/${process.env.selectedWorkspace}/tasks/${process.env.taskId}/lastLog/end`]: currentDate }


    const updateBody = { ...updateWsLastLogTotalTasks, ...updateTaskLastLogEnd }

    await fbDatabase.ref("/").update(updateBody)



    if (process.env.runSequence === 'sequential' && process.env.runNext === 'true') {

        await triggerNextTask(process.env.taskId)
    }
}

async function getContentsFromWorkflowRepo({ owner, repoName, tree, token }) {

    const getContent = async function ({ path }) {
        const fetchPath = `https://api.github.com/repos/${owner}/${repoName}/contents/${path}`

        const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
        const data = await response.json()

        return data;
    }

    const withoutTypeTree = tree.filter(f => f.type !== 'tree')
    const contents = []
    for (let t of withoutTypeTree) {
        const content = await getContent({ path: t.path })

        contents.push(content)
    }

    return contents
}

async function getWorkflowSourceCodeTree({ owner, repoName, token, selectedBranch }) {

    // Retrieve source code for project
    //Retrieved source code will be copied to project branch of forked agregators repo
    //---- List branches endpoint----
    /*required for the next endoint*/
    const fetchPath = `https://api.github.com/repos/${owner}/${repoName}/branches`

    const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
    const data = await response.json()

    const mainSha = data.find(d => d.name === selectedBranch)

    const { commit: { sha } } = mainSha

    //------Git database / Get a tree endpoint------
    /*required to retrieve list of file and folder into*/
    const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/${sha}?recursive=1`, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
    const treeData = await treeResponse.json()
    const { tree } = treeData

    return tree
}
async function triggerAction({ ticket, body, gh_action_url }) {
    await fetch(gh_action_url, {
        method: 'post',
        headers: {
            authorization: `token ${ticket}`,
            Accept: 'application/vnd.github.v3+json'
        },
        body
    })

}
module.exports = { runRepo, triggerAction }