// server dependencies
const
http          = require('http'),
finalhandler  = require('finalhandler'),
Router        = require('router'),
// elasticsearch client
elasticsearch = require('elasticsearch'),
client        = elasticsearch.Client({host: 'localhost:9200'}),
// the router for our app
router        = Router();

const ProgramCache = require('./es/programs/cache').Cache;
const programCache = new ProgramCache(client);

/*********************************************************************/
/*                         ROUTE HANDLERS                            */


/* 
    api handlers => publicly accessible
    route prefix = api
*/
const
UserScreenerHandler   = require('./handlers/api/user-master-screener').UserDocumentHandler,
UserProgramsHandler   = require('./handlers/api/user-programs').ProgramHandler,
UserQuestionsHandler  = require('./handlers/api/user-questions').QuestionsHandler;


/*
    protected handlers => should be protected by basic auth => use nginx or other reverse proxy server
    route prefix = protected
*/
const
KeyHandler                = require('./handlers/protected/keys').KeyHandler,
MasterScreenerHandler     = require('./handlers/protected/master-screener').MasterScreenerHandler,
ProtectedProgramHandler   = require('./handlers/protected/programs').ProtectedProgramHandler,
ProtectedQuestionsHandler = require('./handlers/protected/questions').ProtectedQuestionsHandler,
LoginHandler              = require('./handlers/protected/login').LoginHandler;
// ProgramHandler        = require('./handlers/programs').ProgramHandler,
// QuestionsHandler      = require('./handlers/questions').QuestionsHandler,


/*********************************************************************/
/*                  APPLY ROUTE HANDLERS TO APP ROUTER               */

// apply all the api to the router
KeyHandler.addRoutes(client, router);
MasterScreenerHandler.addRoutes(client, router);
ProtectedProgramHandler.addRoutes(client, programCache, router);
ProtectedQuestionsHandler.addRoutes(client, router);
LoginHandler.addRoutes(router);

UserProgramsHandler.addRoutes(client, programCache, router);
UserScreenerHandler.addRoutes(client, programCache, router); 
UserQuestionsHandler.addRoutes(client, router);
/******************************************************************** */


// check if alive etc
router.get('/ping', (_, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ response: 'operational' }));
});

// 404ish type route handler 
router.get(/^(.*)$/, (_, res) => {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Unknown Command'}));
});


// expose server on local host, expected that this is behind reverse proxy
const server = http.createServer( (req, res) => {
  router(req, res, finalhandler(req, res));
});
server.listen(3000);
