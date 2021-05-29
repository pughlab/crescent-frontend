const eventLogger = (event, error) => {
  console.log('onKeycloakEvent', event, error)
}

const tokenLogger = (tokens) => {
  console.log('onKeycloakTokens', tokens)
  const {token} = tokens
  localStorage.setItem('keycloak_token', token)
}

const initOptions = { 
  onLoad: "login-required",
}

export {
  eventLogger,
  tokenLogger,
  initOptions
};