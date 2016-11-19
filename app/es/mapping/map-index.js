const utils = require('../utils');

module.exports = {
  updateMasterMapping
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

// poor naming? used for updating the mappings
function compareProperties(upload, old){
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

async function updateMasterMapping(client, newMapping) {
  const currentMapping = await extractMasterMapping(client);
  const properties = keysToProperties(newMapping);
  const updatedMapping = compareProperties(properties, currentMapping);
  const update = await utils.initMapping(client, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE, updatedMapping);
  return update;
}
