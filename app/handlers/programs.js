const
bodyParser   = require('body-parser'),
Router       = require('router'),
percolator   = require('../es/percolator/init-percolator'),
programs     = require('../es/programs/user-facing-upload'),
applyGUID    = require('../utils/programs').applyGUID;

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
  return (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if(req.body === undefined || req.body.application === undefined || req.body.user === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'program is not well formed'
      }));
    }
    if(req.body.guid !== 'new') {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'POST messages to /programs/ are for programs with a "new" guid only'
      }));
    }

    // mutate the uploaded program to have a new random guid
    let programWithGUID;
    try {
      programWithGUID = applyGUID(req.body);
    } catch(error) {
      console.error(error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: error.message
      }));
    }

    const application = programWithGUID.application;
    const program = programWithGUID.user;
    percolator.addQueries(client, application)
      .then( () => programs.handleProgramUpload(client, program))
      .then( () => res.end(JSON.stringify({created: true})))
      .catch( error => {
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: error.message
        }));
      });
  };
}
