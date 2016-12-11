const
bodyParser   = require('body-parser'),
Router       = require('router'),
percolator   = require('../es/percolator/percolate-document').percolateUserData,
search       = require('../es/programs/search').searchProgramByGuid;

// handle a user submitted 'master screener' form
class UserDocumentHandler {
  static addRoutes(client, cache, router) {
    if (client === undefined) {
      throw new Error('[BOOTSTRAP]: client argument undefined in UserDocumentHandler');
    }
    const api = Router();
    api.use(bodyParser.json());

    // percolate the user submitted data => find programs the user qualifies for
    api.post('/', percolateUserData(client, cache));
    // this is the router that handles all incoming requests for the server
    router.use('/api/user_master_screener/', api);
  }
}

module.exports = {
  UserDocumentHandler
};

function percolateUserData(client, cache) {
  return (req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if (req.body === undefined || req.body.data === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'master_screener user data is not well formed'
      }));
      return next();
    }
    const data = req.body.data;
    percolator(client, data)
      .then(guids => search(client, guids))
      .then(programs => {
        const extractedPrograms = programs.reduce( (accum, program) => {
          accum.push(program.doc);
          return accum;
        }, []);
        res.end(JSON.stringify({response: extractedPrograms}));
        next();
      })
      .catch(error => {
        res.statusCode = 500;
        res.end(JSON.stringify({
          message : error.message
        }));
      });
  };
}
