const utils = require('../utils');

module.exports = {
  addKeys
};

async function extractMasterMapping(client) {
  const mappingReqRes = await utils.getMapping(client, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE);
  const properties = mappingReqRes[utils.CONSTANTS.INDEX].mappings[utils.CONSTANTS.TYPE].properties;
  if (properties === undefined) {
    Object.assign(mappingReqRes[utils.CONSTANTS.INDEX].mappings[utils.CONSTANTS.TYPE], {
      properties: {}
    });
  }
  return Object.assign({}, mappingReqRes[utils.CONSTANTS.INDEX].mappings[utils.CONSTANTS.TYPE].properties);
}

// poor naming? used when we need to add keys, compares current properties and missing properties
function compareAddProperties(upload, old){
  if (upload === undefined || old === undefined) {
    throw new Error('[ADD_KEYS] upload or old undefined in app/es/mapping/map-index.compareAddProperties');
  }

  /* key in this context is just a property name
  old:{                         upload: {           missing: {
      age: 'integer',             income: 'integer'   income: 'integer'
      married: 'boolean'
    }                           }                   }

    have to find missing, because we have to redefine mapping to include both new keys and old keys.
    if, it does not matter that there is a redefinition we can simplify into one Object.assign(old, upload).
    TODO: determine if it is possible to remap fields dynamically.
  */
  const missing = Object.keys(upload).reduce((missing, key) => {
    if (old.hasOwnProperty(key) && upload[key].type === old[key].type) {
      return missing;
    } else if(old.hasOwnProperty(key) && upload[key].type !== old[key].type){
      throw new Error(`attempted redefinition of ${key} from ${old[key].type} to ${upload[key].type}`);
    }
    missing[key] = upload[key];
    return missing;
  }, {});
  return Object.assign(old, missing);
}


// *** NEED TO ENSURE THAT A KEY DOES NOT HAVE A TYPE 'number' ****
function keysToProperties(keys) {
  return keys.reduce( (properties, key) => {
    let type;
    key.type === 'number' ? type = 'integer' : type = key.type;
    properties[key.name] = {};
    properties[key.name].type = type;
    return properties;
  }, {});
}

async function addKeys(client, newMapping) {
  const currentMapping = await extractMasterMapping(client);
  const properties = keysToProperties(newMapping);
  const updatedMapping = compareAddProperties(properties, currentMapping);
  const update = await utils.initMapping(client, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE, updatedMapping);
  return update;
}
