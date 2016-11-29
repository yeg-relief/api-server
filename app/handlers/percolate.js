const
bodyParser   = require('body-parser'),
Router       = require('router'),
percolator   = require('../es/percolator/percolate-document').percolateUserData;

// handle a user submitted 'master screener' form
class UserDocumentHandler {
  static addRoutes(client, router) {
    if (client === undefined) {
      throw new Error('[BOOTSTRAP]: client argument undefined in UserDocumentHandler');
    }
    const api = Router();
    api.use(bodyParser.json());

    // percolate the user submitted data => find programs the user qualifies for
    api.post('/', percolateUserData(client));
    // this is the router that handles all incoming requests for the server
    router.use('/userMasterScreener/', api);
  }
}

module.exports = {
  UserDocumentHandler
};

function percolateUserData(client) {
  return (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if (req.body === undefined || req.body.data === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'master_screener user data is not well formed'
      }));
    }

    const data = req.body.data;
    console.log('*** data ***');
    console.log(data);
    percolator(client, data)
      .then(data => res.end(JSON.stringify({response: data})))
      .catch(error => {
        res.statusCode = 500;
        console.log('*** error ****');
        console.log(error.message);
        res.end(JSON.stringify({
          message : error.message
        }));
      });
  };
}
