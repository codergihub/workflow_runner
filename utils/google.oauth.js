async function getGoogleToken() {
  const firebaseServerTime = `${projectUrl}/inc/.json?auth=${idToken}`
  const firebaseServerTimeResponse = await fetch(firebaseServerTime, { method: 'put', body: JSON.stringify({ ".sv": "timestamp" }) })
  const currenttimestamp = await firebaseServerTimeResponse.json()
  if ((process.env.google_expires_in * 1000 + process.env.google_timestamp) < currenttimestamp) {
    //refresh token
    const authresponse = await nodeFetch({ host: 'workflow-runner.netlify.app', path: `/.netlify/functions/google-refresh?refresh_token=${process.env.google_refresh_token}`, method: 'get', headers: { 'User-Agent': 'node.js', 'Content-Type': 'application/json' } })
    let authData = JSON.parse(authresponse)
    const update = { google: { scope, timestamp: { '.sv': "timestamp" }, ...authData } }
    const host = process.env.databaseHost
    const path = `/oauth/users/${process.env.uid}/workspaces/${process.env.selectedWorkspace}/auth.json?auth=${process.env.idToken}`

    const port = process.env.dbPort && parseInt(process.env.dbPort)
    const ssh = process.env.dbSsh === 'true'
    debugger;
    let response = {}
    if (port) {
      response = await nodeFetch({ host, path, method: 'PATCH', body: JSON.stringify(update), port, ssh })
    } else {
      response = await nodeFetch({ host, path, method: 'PATCH', body: JSON.stringify(update) })
    }
    const data = JSON.parse(response)
    process.env.google_access_token = authData.access_token
    process.env.google_refresh_token = authData.refresh_token
    process.env.google_expires_in = authData.expires_in
    process.env.google_timestamp = data.timestamp

    //update firebase
  } else {
    //return access token
    return process.env.google_access_token

  }



  debugger;

  return authData.access_token
}

module.exports = { getGoogleToken }