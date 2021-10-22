require('dotenv').config()
const fetch = require('node-fetch')
const fs = require('fs')
const makeDir = require('make-dir');
const pather = require('path')
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
var workflowPath = ''
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
  workflowPath = process.env.workflowPath

} else {
  const splitted = process.env.parameters.split('--xxx--')
  gh_token = splitted[0]
  owner = splitted[1]
  idToken = splitted[2]
  email = splitted[3]
  localId = splitted[4]
  refreshToken = splitted[5]
  selectedContainer = splitted[6]
  projectUrl = splitted[7]
  selectedWorkspace = splitted[8]
  workflowPath = splitted[9]


}

//1.get workflows info from firebase
//const feturl = `${projectUrl}/workspaces/${selectedWorkspace}/containers/${selectedContainer}/workflows/.json?auth=${idToken}`
const feturl = `${projectUrl}/${workflowPath}/.json?auth=${idToken}`
debugger;
fetch(feturl).then(response => response.json()).then(async data => {

  const { screenName, selectedRepo } = data

  console.log('data...', data)
  debugger;




  //1.GET CONTENTS FROM WORKFLOW REPO
  const tree = await getWorkflowSourceCodeTree({ owner: screenName, repo: selectedRepo, token: gh_token })

  const contents = await getContentsFromWorkflowRepo({ owner: screenName, repo: selectedRepo, tree, token: gh_token })
  //2.SAVE CONTENT TO ROOT FOLDER
  debugger;
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

  console.log('dependencies....', dependencies)
  //npm i ${dependencies}
  var cmd = exec(process.env.LOCAL === 'true' ? `echo 'local dev....'` : `npm install ${dependencies}`, function (err, stdout, stderr) {
    console.log('stderr', stderr)
    if (err) {

      // handle error
      console.log('dependencies not installed', err)
    }
    else {

      //4.RUN WORKFLOW ENTRY FILE
      console.log('dependencies installed')


      const main = require(`${process.cwd()}/${selectedRepo}/main`)

      main()

    }
    console.log(stdout);
  });


}).catch(error => {
  debugger;
  console.log('error', error)

})




async function getContentsFromWorkflowRepo({ owner, repo, tree, token }) {

  const getContent = async function ({ path }) {
    const fetchPath =`https://api.github.com/repos/${owner}/${repo}/contents/${path}`
    console.log('fetchpath----',fetchPath)
    const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
    const data = await response.json()
    debugger;
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
  const fetchPath =`https://api.github.com/repos/${owner}/${repo}/branches`
  console.log('fetchpath...',fetchPath)
  const response = await fetch(fetchPath, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
  const data = await response.json()
console.log('data !!!!!',data)
  const mainSha = data.find(d => d.name === 'main')
  const { commit: { sha } } = mainSha

  //------Git database / Get a tree endpoint------
  /*required to retrieve list of file and folder into*/
  const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, { method: 'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
  const treeData = await treeResponse.json()
  const { tree } = treeData

  return tree
}


// process.on('exit',   async()=> {
//   debugger;
//   try {


//   if (filterComplete.length > 0) {

//     const parameters = `${token}--xxx--${owner}--xxx--${idToken}--xxx--${email}--xxx--${localId}--xxx--${refreshToken}--xxx--${selectedContainer}--xxx--${projectUrl}--xxx--${workspaceSelected}`
//     debugger;
//     const body = JSON.stringify({ ref: 'main', inputs: { projectName: selectedContainer, parameters } })
//   await   triggerAction({ gh_action_url: `https://api.github.com/repos/${owner}/workflow_runner/actions/workflows/aggregate.yml/dispatches`, ticket: token, body })
//     debugger;
//   } else {
//     console.log('no more workflow')
//     debugger;
//   }
//   console.log('Goodbye!');

// } catch (error) {
//     debugger;
// }
// });
debugger;
async function triggerAction({ ticket, body, gh_action_url }) {
  debugger;

  await fetch(gh_action_url, {
    method: 'post',
    headers: {
      authorization: `token ${ticket}`,
      Accept: 'application/vnd.github.v3+json'
    },
    body
  })


}
/*
require('dotenv').config()
const fetch = require('node-fetch')
const fs =require('fs')
const makeDir = require('make-dir');
const pather =require('path')
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


} else {
  const splitted = process.env.parameters.split('--xxx--')
  gh_token = splitted[0]
  owner = splitted[1]
  idToken = splitted[2]
  email = splitted[3]
  localId = splitted[4]
  refreshToken = splitted[5]
  selectedContainer = splitted[6]
  projectUrl = splitted[7]
  selectedWorkspace = splitted[8]


}

//1.get workflows info from firebase
const feturl = `${projectUrl}/workspaces/${selectedWorkspace}/containers/${selectedContainer}/workflows/.json?auth=${idToken}`

fetch(feturl).then(response => response.json()).then(async data => {
  const workflows = Object.entries(data)
  for (let wf of workflows) {
    const repo=wf[1]['selectedRepo']

    //1.GET CONTENTS FROM WORKFLOW REPO
    const tree =await getWorkflowSourceCodeTree({owner,repo,token:gh_token})

    const contents =await getContentsFromWorkflowRepo({owner,repo,tree,token:gh_token})
    //2.SAVE CONTENT TO ROOT FOLDER

    for(let c of contents){
      const {content,path}=c
      const utfContent = Buffer.from(content, 'base64').toString('utf-8')

      const filepath =`${process.cwd()}/${repo}/${path}`
      const dirpath =pather.dirname(filepath)
        makeDir.sync(dirpath)
      fs.writeFileSync(filepath,utfContent)


    }

  }
  //3.INSTALL DEPENDENECIES
  let wfDependencies={}
  let dependencyArray=[]
  let dependencies=''
  for (let wf of workflows) {
    const repo=wf[1]['selectedRepo']
    const {dependencies} =require(`${process.cwd()}/${repo}/package.json`)
    wfDependencies={...wfDependencies,...dependencies}

  }

  for(let obj in  wfDependencies){
    const value =wfDependencies[obj].replace('^','')
    dependencyArray.push(`${obj}@${value}`)

  }
  dependencies=dependencyArray.join(' ')

  console.log('dependencies....',dependencies)
  //npm i ${dependencies}
    var cmd = exec(`npm install ${dependencies}`, function(err, stdout, stderr) {
      console.log('stderr',stderr)
      if (err) {

        // handle error
        console.log('dependencies not installed',err)
      }
      else{

        //4.RUN WORKFLOW ENTRY FILE
        console.log('dependencies installed')

          for (let wf of workflows) {
            const repo=wf[1]['selectedRepo']

            const main =require(`${process.cwd()}/${repo}/main`)

         main()
          }
      }
      console.log(stdout);
    });


}).catch(error => {
  console.log('error',error)

})




async function getContentsFromWorkflowRepo({owner,repo,tree,token}) {

  const getContent = async function ({ path }) {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`,{method:'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } })
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

async function getWorkflowSourceCodeTree({owner,repo,token}) {

  // Retrieve source code for project
  //Retrieved source code will be copied to project branch of forked agregators repo
  //---- List branches endpoint----

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`,{method:'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } } )
  const data = await response.json()

  const mainSha = data.find(d => d.name === 'main')
  const { commit: { sha } } = mainSha

  //------Git database / Get a tree endpoint------

  const treeResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`,{method:'GET', headers: { Accept: "application/vnd.github.v3+json", authorization: `token ${token}` } }  )
  const treeData = await treeResponse.json()
  const { tree } = treeData

  return tree
}
*/