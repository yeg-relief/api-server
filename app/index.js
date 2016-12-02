// server dependencies
const
http          = require('http'),
finalhandler  = require('finalhandler'),
Router        = require('router'),
// elasticsearch client
elasticsearch = require('elasticsearch'),
client        = elasticsearch.Client({host: 'localhost:9200', log: 'trace'}),
// the router for our app
router        = Router();

// secret.js contains credentials
let credentials;
try {
  credentials = require('./secret');
} catch(error) {
  // default credentials if file doesn't exist
  credentials = {
    name: 'admin',
    pass: 'pass'
  };
}

// handler functions for calls
const
KeyHandler            = require('./handlers/keys').KeyHandler,
ProgramHandler        = require('./handlers/programs').ProgramHandler,
UserScreenerHandler   = require('./handlers/percolate').UserDocumentHandler;

// apply all the api to the router
KeyHandler.addRoutes(client, router); // /keys/
ProgramHandler.addRoutes(client, router); // /programs/
UserScreenerHandler.addRoutes(client, router); // /userMasterScreener/ TODO: think of better name

router.get('/ping', (_, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ response: 'operational' }));
});
// can't match any command
router.get(/^(.*)$/, (_, res) => {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Unknown Command'}));
});

const server = http.createServer( (req, res) => {
  router(req, res, finalhandler(req, res));
});
server.listen(3000);
