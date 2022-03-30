const { fbRest } = require('../firebase-rest')
const fetch = require('node-fetch')
const fbDatabase = fbRest()
async function getGoogleToken() {
debugger;
  const selectedWorkspace = process.env.selectedWorkspace

  const currenttimestamp = await fbDatabase.ref("/").update({ inc: { ".sv": "timestamp" } })

  if ((process.env.google_expires_in * 1000 + process.env.google_timestamp) < currenttimestamp) {
    debugger;
    //refresh token
    const fetchpath = `https://workflow-runner.netlify.app/.netlify/functions/google-refresh?refresh_token=${process.env.google_refresh_token}`
    const authresponse = await fetch(fetchpath, { method: 'GET', headers: { 'User-Agent': 'node.js', 'Content-Type': 'application/json' } })
    let authData = await authresponse.json()
    const update = { scope, timestamp: { '.sv': "timestamp" }, ...authData }
    const path = `oauth/users/${process.env.uid}/workspaces/${selectedWorkspace}/auth/google`

    const data = await fbDatabase.ref(path).update(update)

    process.env.google_access_token = authData.access_token
    process.env.google_refresh_token = authData.refresh_token
    process.env.google_expires_in = authData.expires_in
    process.env.google_timestamp = data.timestamp
    return process.env.google_access_token
    //update firebase
  } else {
    debugger;
    //return access token
    return process.env.google_access_token
  }

}

module.exports = { getGoogleToken }