const jsonServer = require('json-server');

const cleverbridgeMockV1 = require('./cleverbridge/v1');


run = (env) => {
    SERVER_ADDRESS = env.MOCK_SERVER_ADDRESS || '0.0.0.0';
    SERVER_PORT = env.MOCK_SERVER_PORT || 3000;

    const server = jsonServer.create();
    const defaultMiddlewares = jsonServer.defaults();

    server.use(defaultMiddlewares);
    server.use('/cleverbridge/v1', cleverbridgeMockV1(env, 'cleverbridge.json'));

    server.listen(SERVER_PORT, SERVER_ADDRESS, function () {
      console.log(`Mock server is running on ${SERVER_ADDRESS}:${SERVER_PORT}...`);
    });
}


if (require.main === module) {
    run(process.env);
}
