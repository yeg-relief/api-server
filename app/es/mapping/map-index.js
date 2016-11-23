const utils = require('../utils');

module.exports = {
  addKeys
};

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
  const fields = keysToProperties(newMapping);
  const update = await utils.initMapping(client, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE, fields);
  return update;
}
