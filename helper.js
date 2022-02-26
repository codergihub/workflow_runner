async function triggerNextTask(taskId){
    try {
  const splitted = process.env.parameters.split('--xxx--')
  console.log('splitted',splitted)
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
  const runNext="true"
  
  //FIND NEXT TASK
      const fetchUrl = `${projectUrl}/server/workspaces/${workspaceName}/tasks/.json?auth=${idToken}`
      const tasks= await fetchTasks(fetchUrl)
      const currentTaskIndex =tasks.findIndex(t=>t.taskId===taskId)
      const nextTaskIndex=currentTaskIndex+1
      const nextTask =tasks.find((t,i)=>i===nextTaskIndex)
      const nextTaskId =nextTask['taskId']
      debugger;
  //SET URL PARAMS
      const parameters = `${token}--xxx--${owner}--xxx--${idToken}--xxx--${email}--xxx--${uid}--xxx--${refreshToken}--xxx--${'selectedContainer'}--xxx--${projectUrl}--xxx--${workspaceName}--xxx--${runid}--xxx--${start}--xxx--${nextTaskId}--xxx--${runNext}`
      const body = JSON.stringify({ ref: 'main', inputs: { projectName: workspaceName, parameters } })
      const gitactionurl=`https://api.github.com/repos/${owner}/workflow_runner/actions/workflows/aggregate.yml/dispatches`
  //POST HTTP
      const response = await fetch(gitactionurl, {
          method: 'post',
          headers: {
              authorization: `token ${ticket}`,
              Accept: 'application/vnd.github.v3+json'
          },
          body
      })
      const data = await response.json()
  //UPDATE FIREBASE
      
  } catch (error) {
  
  }
  }


  async function fetchTasks(url){

    const response = await fetch(url)
    const tasks =await response.json()
  
  debugger;
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

  
  
  module.exports={triggerNextTask}