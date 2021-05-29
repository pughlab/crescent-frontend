const tokenRequester = require('keycloak-request-token')

const username = process.argv[2]
const password = process.argv[3]

const baseUrl = `http://${process.env.LOCAL_IP}:8080/auth/`,
const settings = {
    username: username || 'developer',
    password: password || 'developer',
    grant_type: 'password',
    realmName: 'crescent',
    client_id: 'crescent-app',
}

tokenRequester(baseUrl, settings)
  .then((token) => {
    const headers = {
      Authorization: `Bearer ${token}`
    }
    console.log(JSON.stringify(headers))
  }).catch((err) => {
    console.log('err', err)
  })