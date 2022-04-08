// import { createRequire } from "module";
// const require = createRequire(import.meta.url);
const fetch =require('node-fetch')
const EventSource = require('eventsource')
function fbRest() {
    this.url = ''
    this.idToken = '',
        this.projectUri = '',
        this.orderByChildValue = '',
        this.equalToValue = '',
        this.limitToLastValue = 0

    return {
        setIdToken: function (idToken) {
            this.idToken = idToken

            return this
        },
        setProjectUri: function (projectUri) {
            this.projectUri = projectUri

            return this
        },
        ref: function (url) {

            this.url = url
            return this
        },
        set:async function (data) {
            const idToken = process.env.idToken
            const refreshToken = process.env.refreshToken
            const api_key = process.env.api_key
            const localId = process.env.localId
            const projectUrl = process.env.projectUrl
            const fetchUrl = this.url === '/' ? `${projectUrl}/.json?auth=${idToken}` : `${projectUrl}/${this.url}.json?auth=${idToken}`
            const response = await fetch(fetchUrl, { method: 'PUT', body: JSON.stringify(data) })
            const status = response.status
            const statusText = response.statusText
            if (status === 401 && statusText === 'Unauthorized') {

                const data = await response.json()
                const error = data['error']
                if (error && error === 'Auth token is expired') {

                    await renewIdToken({ api_key, refresh_token: refreshToken, localId })
                    const refreshedIdToken = process.env.idToken
                    const fetchUrl2 = this.url === '/' ? `${projectUrl}/.json?auth=${refreshedIdToken}` : `${projectUrl}/${this.url}.json?auth=${refreshedIdToken}`
                    const response = await fetch(fetchUrl2, { method: 'GET' })
                    const data = await response.json()
                    return data
                } else {
                    throw 'Unhandled firebase auth error'
                }
            } else {
                const data = await response.json()
                return data
            }

        },
        get: async function () {
            const idToken = process.env.idToken
            const refreshToken = process.env.refreshToken
            const api_key = process.env.api_key
            const localId = process.env.localId
            const projectUrl = process.env.projectUrl
            const fetchUrl = this.url === '/' ? `${projectUrl}/.json?auth=${idToken}` : `${projectUrl}/${this.url}.json?auth=${idToken}`
            const response = await fetch(fetchUrl, { method: 'GET' })
            const status = response.status
            const statusText = response.statusText
            if (status === 401 && statusText === 'Unauthorized') {

                const data = await response.json()
                const error = data['error']
                if (error && error === 'Auth token is expired') {
                    await renewIdToken({ api_key, refresh_token: refreshToken, localId })
                    const refreshedIdToken = process.env.idToken
                    const fetchUrl2 = this.url === '/' ? `${projectUrl}/.json?auth=${refreshedIdToken}` : `${projectUrl}/${this.url}.json?auth=${refreshedIdToken}`
                    const response = await fetch(fetchUrl2, { method: 'GET' })
                    const data = await response.json()
                    return data
                } else {
                    throw 'Unhandled firebase auth error'
                }
            } else {
                const data = await response.json()
                return data
            }
        },
        update: async function (data,) {

       
            const idToken = process.env.idToken
            const refreshToken = process.env.refreshToken
            const api_key = process.env.api_key
            const localId = process.env.localId
            const projectUrl = process.env.projectUrl
            const fetchUrl = this.url === '/' ? `${projectUrl}/.json?auth=${idToken}` : `${projectUrl}/${this.url}.json?auth=${idToken}`
            const response = await fetch(fetchUrl, { method: 'PATCH', body: JSON.stringify(data) })
            const status = response.status
            const statusText = response.statusText
            if (status === 401 && statusText === 'Unauthorized') {

                const data = await response.json()
                const error = data['error']
                if (error && error === 'Auth token is expired') {

                    await renewIdToken({ api_key, refresh_token: refreshToken, localId })
                    const refreshedIdToken = process.env.idToken
                    const fetchUrl2 = this.url === '/' ? `${projectUrl}/.json?auth=${refreshedIdToken}` : `${projectUrl}/${this.url}.json?auth=${refreshedIdToken}`
                    const response = await fetch(fetchUrl2, { method: 'GET' })
                    const data = await response.json()
                    return data
                } else {
                    throw 'Unhandled firebase auth error'
                }
            } else {
                const data = await response.json()
                return data
            }
        },
        push: async function (data) {
            const idToken = process.env.idToken
            const refreshToken = process.env.refreshToken
            const api_key = process.env.api_key
            const localId = process.env.localId
            const projectUrl = process.env.projectUrl
            const fetchUrl = this.url === '/' ? `${projectUrl}/.json?auth=${idToken}` : `${projectUrl}/${this.url}.json?auth=${idToken}`
            const response = await fetch(fetchUrl, { method: 'post', body: JSON.stringify(data) })
            const status = response.status
            const statusText = response.statusText
            if (status === 401 && statusText === 'Unauthorized') {
                const data = await response.json()
                const error = data['error']
                if (error && error === 'Auth token is expired') {
                    await renewIdToken({ api_key, refresh_token: refreshToken, localId })
                    const refreshedIdToken = process.env.idToken
                    const fetchUrl2 = this.url === '/' ? `${projectUrl}/.json?auth=${refreshedIdToken}` : `${projectUrl}/${this.url}.json?auth=${refreshedIdToken}`
                    const response = await fetch(fetchUrl2, { method: 'GET' })
                    const data = await response.json()
                    return data
                } else {
                    throw 'Unhandled firebase auth error'
                }
            } else {
                const data = await response.json()
                return data
            }
        },
        on: function (event, cb) {

            switch (event) {
                case "value":
                    const fetchPath = `${this.projectUri}/${this.url}.json?auth=${this.idToken}`

                    var childaddedEvent = new EventSource(fetchPath, {});
                    childaddedEvent.onerror = function (error) {

                        cb(error, null)
                    };
                    childaddedEvent.addEventListener('put', function (e) {
                        const response = JSON.parse(e.data)

                        cb(null, response)
                        console.log(e.data)
                    })
                    break;
                default:
                    ""
            }

        },
        once: function (type, cb) {

            const fetchPath = `${this.projectUri}/${this.url}.json?auth=${this.idToken}`

            fetch(fetchPath).then(response => response.json()).then(data => {

                cb && cb(null, data)
            }).catch(error => {

                cb && cb(error, null)
                return this
            })
        },
        orderByChild: function (orderByChildValue) {
            this.orderByChildValue = orderByChildValue
            return this
        },
        orderByKey: function (orderByKeyValue) {
            this.orderByChildValue = orderByKeyValue
            return this
        },
        equalTo: function (equalToValue) {
            this.equalToValue = equalToValue
            return this
        },
        limitToLast: function (limitToLastValue) {
            this.limitToLastValue = limitToLastValue
            return this
        },
    }
}



async function renewIdToken({ api_key, refresh_token, localId }) {

    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${api_key}`, { method: 'post', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: `grant_type=refresh_token&refresh_token=${refresh_token}` })

    const { id_token, refresh_token: newRefreshToken } = await response.json()
    //update firebase
    const fetchUrl = `${window.projectUrl}/.json?auth=${id_token}`
    const responses = await fetch(fetchUrl, { method: 'PATCH', body: JSON.stringify({ [`oauth/users/${localId}/firebase/idToken`]: id_token, [`oauth/users/${localId}/firebase/refreshToken`]: newRefreshToken,[`oauth/users/${localId}/firebase/date`]: new Date()}) })

    //update env

    process.env.idToken = id_token
    process.env.refreshToken = newRefreshToken

  

}






module.exports = { fbRest, renewIdToken }