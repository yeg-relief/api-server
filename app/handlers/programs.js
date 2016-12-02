const
bodyParser      = require('body-parser'),
Router          = require('router'),
percolator      = require('../es/percolator/init-percolator'),
programs        = require('../es/programs/user-facing-upload'),
applyMetaData   = require('../utils/programs').applyMetaData;

class ProgramHandler {
  static addRoutes(client, router) {
    if (client === undefined) {
      throw new Error('[BOOTSTRAP]: client argument undefined in ProgramHandler');
    }
    const api = Router();
    api.use(bodyParser.json());

    // add queries for programs to the ES /search index
    api.post('/', uploadNewProgram(client));
    // this is the router that handles all incoming requests for the server
    router.use('/programs/', api);
  }
}

module.exports = {
  ProgramHandler
};

function uploadNewProgram(client) {
  return (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if(req.body === undefined || req.body.application === undefined || req.body.user === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'program is not well formed'
      }));
      return next();
    }
    if(req.body.guid !== 'new') {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'POST messages to /programs/ are for programs with a "new" guid only'
      }));
      return next();
    }

    // mutate the uploaded program and apply timestamp and GUID
    let programWithMetaData;
    try {
      programWithMetaData = applyMetaData(JSON.parse(req.body));
    } catch(error) {
      console.error(error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: error.message
      }));
      return next();
    }
    const application = programWithMetaData.application;
    const program = programWithMetaData.user;
    percolator.addQueries(client, application)
      .then( () => programs.handleProgramUpload(client, program, programWithMetaData.guid))
      .then( () => res.end(JSON.stringify({created: true})))
      .catch( error => {
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: error.message
        }));
      });
  };
}
