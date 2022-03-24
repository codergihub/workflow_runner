debugger;
require('dotenv').config()
const {updateIdToken}=require('./firebase-rest')

const timestamp = parseInt(process.env.timestamp)
debugger;
updateIdToken()