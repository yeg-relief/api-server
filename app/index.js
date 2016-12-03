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


const Cache = require('./es/programs/cache').Cache;
const cache = new Cache(client);
setTimeout(() => {
  cache.getPrograms(['4abee839-3958-4914-a9c1-2bb1a3fc17ea', 'test']).then((thing) => console.log(thing));
  console.log('timeout executed');
}, 2500);
setTimeout(() => {
  cache.addPrograms([
    {
      _id: 'test-1',
      _source: {
        doc: {
          value: 'a value'
        }
      }
    },
    {
      _id: 'test-2',
      _source: {
        doc: {
          value: 'a valuezzz'
        }
      }
    }
  ]);
}, 5000);
setTimeout(() => {
  cache.getPrograms(['test-2']).then((thing) => console.log(thing));
  console.log('timeout executed');
}, 7500);
setTimeout(() => {
  console.log('getting all programgs \n\n');
  cache.getAllPrograms().then(thing => console.log(thing));
}, 10000);
/*
setTimeout( () => cache.cache$.subscribe(val => console.log(val)), 5000);
setTimeout( () => cache.cache$.do(() => console.log('subscribed')).subscribe(val => console.log(val)), 7000);
*/
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
