const utils = require('../utils');

module.exports = {
  addKeys,
  deleteKey
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

/*
deleting a key is not straightforward, this is a list of sources to investigate.

http://stackoverflow.com/a/38874129/764384
https://www.elastic.co/guide/en/elasticsearch/reference/2.3/docs-reindex.html
https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
*/
async function deleteKey(client, keyName) {
  return;
}