const jsonServer = require('json-server')

const cleverbridgeMockV1 = require('./cleverbridge/v1')

const run = (env) => {
  const SERVER_ADDRESS = env.MOCK_SERVER_ADDRESS || '0.0.0.0'
  const SERVER_PORT = env.MOCK_SERVER_PORT || 8082
  const CLEVERBRIDGE_V1_STATE_PATH =
    env.MOCK_SERVER_CLEVERBRIDGE_V1_STATE_PATH || 'var/cleverbridge.json'

  const server = jsonServer.create()
  const defaultMiddlewares = jsonServer.defaults()

  server.use(defaultMiddlewares)
  server.use(
    '/cleverbridge/v1',
    cleverbridgeMockV1(env, CLEVERBRIDGE_V1_STATE_PATH)
  )

  server.listen(SERVER_PORT, SERVER_ADDRESS, () => {
    console.log(`Mock server is running on ${SERVER_ADDRESS}:${SERVER_PORT}...`)
  })
}

if (require.main === module) {
  run(process.env)
}
