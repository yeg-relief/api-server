const
bodyParser   = require('body-parser'),
Router       = require('router'),
getMapping   = require('../es/mapping/get-mapping'),
mapIndex     = require('../es/mapping/map-index'),
utils        = require('../es/utils');

class KeyHandler {
  // make it available to set client with a config
  static setConfig(config) {
    if(config) {
      this.CONFIG = Object.assign({}, config);
    } else {
      this.CONFIG = {
        client: undefined
      };
    }
  }

  static addRoutes(client, router) {
    // bootstrapping
    if (client === undefined && this.CONFIG.client === undefined) {
      throw new Error('CONFIG.client and client argument both undefined in KeyHandler');
    }
    const cli = client || this.CONFIG.client;
    const api = Router();
    api.use(bodyParser.json());

    // get the mapping for percolator index
    api.get('/', getAllKeys(cli));
    api.post('/', addKeys(cli));
    // the router that was passed in as an argument is now composed from the api
    // just built
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
        res.statusCode = 500;
        if (e.message === `mapping does not exists on ${utils.CONSTANTS.INDEX}/${utils.CONSTANTS.TYPE}`) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            message: e.message,
            keys: []
          }));
        } else if (e.message === undefined){
          res.end(JSON.stringify({
            message: 'undefined'
          }));
        } else {
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
    mapIndex.updateMasterMapping(cli, req.body.keys)
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
