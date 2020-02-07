const admin = require('firebase-admin')
const { google } = require('googleapis')
const axios = require('axios')

const MESSAGING_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
const SCOPES = [MESSAGING_SCOPE]

const serviceAccount = require('./fcm-fbcb7-firebase-adminsdk-96e5z-f3d127284c.json')
const databaseURL = 'https://fcm-fbcb7.firebaseio.com'
const URL =
  'https://fcm.googleapis.com/v1/projects/fcm-fbcb7/messages:send'
const deviceToken =
  'cF6MD3HJCOFLnLAgavJ0Ot:APA91bEsDICMptASluzvhd6YAkUKLyzgkPzCIX_8aRJbrDpIc45a7zX9TDoy6Ya9Uwq649UrzyWkkZpXvpv-qfmuzM7vKuiQJisa1rPxkrYrW7JRbKuj8tx_cCUDKjTwLzuzNnji4qx9'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseURL
})

function getAccessToken() {
  return new Promise(function(resolve, reject) {
    var key = serviceAccount
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    )
    jwtClient.authorize(function(err, tokens) {
      if (err) {
        reject(err)
        return
      }
      resolve(tokens.access_token)
    })
  })
}

async function init() {
  const body = {
    message: {
      data: { key: 'value' },
      notification: {
        title: 'Notification title',
        body: 'Notification body'
      },
      webpush: {
        headers: {
          Urgency: 'high'
        },
        notification: {
          requireInteraction: 'true'
        }
      },
      token: deviceToken
    }
  }

  try {
    const accessToken = await getAccessToken()
    console.log('accessToken: ', accessToken)
    const { data } = await axios.post(URL, JSON.stringify(body), {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    console.log('name: ', data.name)
  } catch (err) {
    console.log('err: ', err.message)
  }
}

init()