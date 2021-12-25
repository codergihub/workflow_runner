
const fetch = require('node-fetch')
const { Worker } = require("worker_threads");
const fs = require('fs')
const makeDir = require('make-dir');
const pather = require('path')

var exec = require('child_process').exec
async function runRepo({ workflow, taskEmitter }) {
    debugger;
    const { screenName, selectedRepo,
        taskName ,
        workflowKey} = workflow

    
    const gh_token = process.env.gh_token
    
    //1.GET CONTENTS FROM WORKFLOW REPO
    const tree = await getWorkflowSourceCodeTree({ owner: screenName, repo: selectedRepo, token: gh_token })
debugger;
    const contents = await getContentsFromWorkflowRepo({ owner: screenName, repo: selectedRepo, tree, token: gh_token })
    //2.SAVE CONTENT TO ROOT FOLDER

    for (let c of contents) {
        const { content, path } = c
        const utfContent = Buffer.from(content, 'base64').toString('utf-8')

        const filepath = `${process.cwd()}/${selectedRepo}/${path}`
        const dirpath = pather.dirname(filepath)
        makeDir.sync(dirpath)
        fs.writeFileSync(filepath, utfContent)

    }
debugger;

    //3.INSTALL DEPENDENECIES

    let dependencyArray = []
    let dependencies = ''


    const { dependencies: originalDependencies } = require(`${process.cwd()}/${selectedRepo}/package.json`)

debugger;


    for (let obj in originalDependencies) {

        const value = originalDependencies[obj].replace('^', '')
        dependencyArray.push(`${obj}@${value}`)

    }
    dependencies = dependencyArray.join(' ')
debugger;
    console.log('dependencies....', dependencies)
    //npm i ${dependencies}
    //process.env.LOCAL === 'true' ? `echo 'local dev....'` : 
    var cmd = exec(process.env.LOCAL === 'true' ? `echo 'local dev....'` : `npm install ${dependencies}`, function (err, stdout, stderr) {
        debugger;
        console.log('stderr', stderr)
        if (err) {

            // handle error
            console.log('dependencies not installed', err)
        }
        else {

            //4.RUN WORKFLOW ENTRY FILE
            console.log('dependencies installed')


            const main = `${process.cwd()}/${selectedRepo}/main.js`
            
            const worker = new Worker(main, { workerData: {} });

            worker.once("message", result => {
                console.log(`${number}th Fibonacci No: ${result}`);
            });

            worker.on("error", error => {
                console.log(error);
                taskEmitter.emit("TASK_RUN_FAILED", { taskName,
                    workflowKey })
            });

            worker.on("exit", exitCode => {
                console.log(`It exited with code ${exitCode}`);
            debugger;
                taskEmitter.emit("TASK_RUN_SUCCESSFUL", { taskName, workflowKey })
            })
            setInterval(() => { }, 5000)
        }
        console.log(stdout);
    });







    async function getContentsFromWorkflowRepo({ owner, repo, tree, token }) {

        const getContent = async function ({ path }) {
            const fetchPath = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`

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

    async function getWorkflowSourceCodeTree({ owner, repo, token }) {

        // Retrieve source code for project
        //Retrieved source code will be copied to project branch of forked agregators repo
        //---- List branches endpoint----
        /*required for the next endoint*/
        const fetchPath = `https://api.github.com/repos/${owner}/${repo}/branches`

        const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
        const data = await response.json()
        debugger;
        const mainSha = data.find(d => d.name === 'main')
        const { commit: { sha } } = mainSha

        //------Git database / Get a tree endpoint------
        /*required to retrieve list of file and folder into*/
        const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
        const treeData = await treeResponse.json()
        const { tree } = treeData

        return tree
    }
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