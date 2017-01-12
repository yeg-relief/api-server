const
  bodyParser = require('body-parser'),
  Router = require('router'),
  percolator = require('../../es/percolator/init-percolator'),
  programs = require('../../es/programs/user-facing-upload'),
  applyMetaData = require('../../utils/programs').applyMetaData,
  Rx = require('rxjs/Rx'),
  utils = require('../../es/utils'),
  progUtils = require('../../utils/programs');

class ProgramHandler {
  static addRoutes(client, cache, router) {
    if (client === undefined || cache === undefined) {
      throw new Error('[BOOTSTRAP]: client or cache undefined in ProgramHandler');
    }
    const api = Router();
    api.use(bodyParser.json());
    api.get('/', getAllPrograms(client, cache));

    // this is the router that handles all incoming requests for the server
    router.use('/api/programs/', api);
  }
}

module.exports = {
  ProgramHandler
};

function getAllPrograms(client, cache) {
  return (_, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    cache.getAllProgramsBase()
      .do(() => res.statusCode = 200)
      //.reduce( (accum, program) => [program.value, ...accum], [])
      .subscribe({
        next: programs => res.end(JSON.stringify({ programs: programs })),
        error: err => {
          res.statusCode = 500;
          console.error(err.message);
          res.send(JSON.stringify({ message: err.message }));
        },
        complete: () => next()
      });
  };
}