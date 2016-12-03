const
bodyParser      = require('body-parser'),
Router          = require('router'),
percolator      = require('../es/percolator/init-percolator'),
programs        = require('../es/programs/user-facing-upload'),
applyMetaData   = require('../utils/programs').applyMetaData,
Rx              = require('rxjs/Rx');

class ProgramHandler {
  static addRoutes(client, cache, router) {
    if (client === undefined || cache === undefined) {
      throw new Error('[BOOTSTRAP]: client or cache undefined in ProgramHandler');
    }
    const api = Router();
    api.use(bodyParser.json());

    api.post('/', uploadNewProgram(client, cache));
    api.get('/', getAllPrograms(client, cache));

    // this is the router that handles all incoming requests for the server
    router.use('/programs/', api);
  }
}

module.exports = {
  ProgramHandler
};

function uploadNewProgram(client, cache) {
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
      programWithMetaData = applyMetaData(req.body);
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
      .then( () => cache.addPrograms([{ program: program, id: programWithMetaData.guid}]))
      .catch( error => {
        res.statusCode = 500;
        console.error(error.message);
        res.end(JSON.stringify({
          message: error.message
        }));
      });
  };
}

function getAllPrograms(client, cache) {
  return (_, res, next) => {
    Rx.Observable.from(_)
      .
  };
}
