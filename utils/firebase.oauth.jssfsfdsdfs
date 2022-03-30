async function getFirebaseToken() {
    const firebaseServerTime = `${projectUrl}/inc/.json?auth=${idToken}`
    const firebaseServerTimeResponse = await fetch(firebaseServerTime, { method: 'put', body: JSON.stringify({ ".sv": "timestamp" }) })
    const currenttimestamp = await firebaseServerTimeResponse.json()
    if ((process.env.firebase_expires_in * 1000 + process.env.firebase_timestamp) < currenttimestamp) {
      //refresh token
      const authresponse = await nodeFetch({ host: 'securetoken.googleapis.com', path: `/v1/token?key=${process.env.api_key}`, method: 'get', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },body: `grant_type=refresh_token&refresh_token=${process.env.firebase_refresh_token}` })
      let authData = JSON.parse(authresponse)
      const update = { timestamp: { '.sv': "timestamp" }, ...authData }
      const host = process.env.databaseHost
      const path = `/oauth/users/${process.env.uid}/workspaces/${process.env.selectedWorkspace}/auth/firebase.json?auth=${process.env.idToken}`
  
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
      process.env.firebase_access_token = authData.access_token
      process.env.firebase_refresh_token = authData.refresh_token
      process.env.firebase_expires_in = authData.expires_in
      process.env.firebase_timestamp = data.timestamp
  
      //update firebase
    } else {
      //return access token
      return process.env.firebase_access_token
  
    }
  
  
  
    debugger;
  
    return authData.access_token
}

module.exports = { getFirebaseToken }