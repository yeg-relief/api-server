const utils = require('../utils');

module.exports = {
  getMasterMapping
};

async function getMasterMapping(client) {
  const mapping =  await utils.getMapping(client, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE);
  console.log(mapping[utils.CONSTANTS.INDEX].mappings[utils.CONSTANTS.TYPE].properties);
  return mapping[utils.CONSTANTS.INDEX].mappings[utils.CONSTANTS.TYPE].properties;
}
