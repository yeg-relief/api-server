// server dependencies
const
http          = require('http'),
finalhandler  = require('finalhandler'),
Router        = require('router'),
// elasticsearch client
elasticsearch = require('elasticsearch'),
client = elasticsearch.Client({host: 'localhost:9200'}),
// the router for our app
router        = Router();

// handler functions for calls
const
KeyHandler     = require('./handlers/keys').KeyHandler,
ProgramHandler = require('./handlers/programs').ProgramHandler;
// apply all the api to the router
KeyHandler.addRoutes(client, router);
ProgramHandler.addRoutes(client, router);

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
