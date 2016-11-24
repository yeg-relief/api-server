const
bodyParser   = require('body-parser'),
Router       = require('router'),
getMapping   = require('../es/mapping/get-mapping'),
mapIndex     = require('../es/mapping/map-index'),
utils        = require('../es/utils');

class KeyHandler {
  /*
    mutate the application level router to handle all routes in the 'keys' API.
  */
  static addRoutes(client, router) {
    if (client === undefined) {
      throw new Error('[BOOTSTRAP]: client argument undefined in KeyHandler');
    }
    const api = Router();
    api.use(bodyParser.json());

    // get the keys/properties for masterscreener
    api.get('/', getAllKeys(client));
    // add keys/properties to masterscreener
    api.post('/', addKeys(client));
    // sets the router arguement to use our 'keys' api
    // this is the router that handles all incoming requests
    router.use('/keys', api);
  }
}

module.exports = {
  KeyHandler
};


function getAllKeys(cli) {
  return (_, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    getMapping.getMasterMapping(cli)
      // transform the mapping into an array of Key objects
      .then(mapping => {
        const keys = [];
        Object.keys(mapping).forEach(key => {
          keys.push({
            name: key,
            type: mapping[key].type
          });
        });
        return keys;
      })
      .then(keys => {
        res.end(JSON.stringify({
          keys: keys
        }));
      })
      .catch(e => {
        if (e.message === `mapping does not exists on ${utils.CONSTANTS.INDEX}/${utils.CONSTANTS.TYPE}`) {
          res.end(JSON.stringify({
            message: e.message,
            keys: []
          }));
        } else {
          res.statusCode = 500;
          res.end(JSON.stringify({
            message: e.message
          }));
        }
      });
  };
}

function addKeys(cli) {
  return (req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    if(req.body.keys === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'keys are undefined'
      }));
    }
    mapIndex.addKeys(cli, req.body.keys)
      .then(update => {
        res.end(JSON.stringify({
          update: update
        }));
      })
      .catch(e => {
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: e.message
        }));
      });
  };
}
