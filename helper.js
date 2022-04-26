require('dotenv').config()
const { fbRest } = require('wflows')
const fbDatabase = fbRest()
const fetch = require('node-fetch')

async function triggerNextTask(taskId) {
    try {
        const splitted = process.env.parameters.split('--xxx--')

        const token = splitted[0]
        const owner = splitted[1]
        const idToken = splitted[2]
        const email = splitted[3]
        const uid = splitted[4]
        const refreshToken = splitted[5]
        const projectUrl = splitted[7]
        const workspaceName = splitted[8]
        const runid = Date.now()
        const start = runid
        const runNext = "true"
        const api_key = splitted[16]
        //FIND NEXT TASK
        const fetchUrl = `server/workspaces/${workspaceName}/tasks`
        const tasks = await fetchTasks(fetchUrl)
        const currentTaskIndex = tasks.findIndex(t => t.taskId === taskId)
        debugger;
        const nextTaskIndex = currentTaskIndex + 1
        const nextTask = tasks.find((t, i) => i === nextTaskIndex)
        if (nextTask) {
            debugger;
            const nextTaskId = nextTask['taskId']
            const runSequence = nextTask['runSequence']
            const first = 'false'
            const wfrunid = process.env.wfrunid
            debugger;

            const parameters = `${token}--xxx--${owner}--xxx--${idToken}--xxx--${email}--xxx--${uid}--xxx--${refreshToken}--xxx--${'selectedContainer'}--xxx--${process.env.projectUrl}--xxx--${workspaceName}--xxx--${runid}--xxx--${start}--xxx--${nextTaskId}--xxx--${runNext}--xxx--${runSequence}--xxx--${first}--xxx--${wfrunid}--xxx--${api_key}`

            debugger;
            const body = JSON.stringify({ ref: 'main', inputs: { projectName: workspaceName, parameters } })

            if (process.env.LOCAL === 'true') {

                await fetch('http://localhost:3001', { body, method: 'post' })
            } else {

                const gitactionurl = `https://api.github.com/repos/${owner}/workflow_runner/actions/workflows/aggregate.yml/dispatches`
                //POST HTTP
                const response = await fetch(gitactionurl, {
                    method: 'post',
                    headers: {
                        authorization: `token ${token}`,
                        Accept: 'application/vnd.github.v3+json'
                    },
                    body
                })
            }

        } else {
            debugger;
            console.log('no more tasks to run')
        }

        //UPDATE FIREBASE

    } catch (error) {
        console.log('error', error)

    }
}


async function fetchTasks(url) {
    const tasks = await fbDatabase.ref(url).get()
    return Object.entries(tasks).map(m => {
        const taskId = m[0]
        const taskProps = m[1]
        return { taskId, ...taskProps }
    }).sort(function compare(a, b) {
        if (a.runOrder < b.runOrder) {
            return -1;
        }
        if (a.runOrder > b.runOrder) {
            return 1;
        }
        return 0;
    }
    )
}



module.exports = { triggerNextTask }