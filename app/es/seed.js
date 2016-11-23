const
utils         = require('./utils'),
elasticsearch = require('elasticsearch');

const emptyMapping = Object.create(null);
emptyMapping[utils.CONSTANTS.TYPE] = {
  properties: {}
};


// will clear index if it exists
async function seed(client, host = 'localhost:9200') {
  const driver = client || elasticsearch.Client({host: host});
  const connected = await utils.testConnect(driver);
  if (!connected) {
    throw new Error(`unable to ping test connection on ${host}`);
  }
  const indexExists = await utils.indexExists(driver, utils.CONSTANTS.INDEX);
  if (indexExists) {
    await utils.deleteIndex(driver, utils.CONSTANTS.INDEX);
  }
  await utils.initIndex(driver, utils.CONSTANTS.INDEX, emptyMapping);
  return true;
}

function init(){
  seed().then(success => console.error(`seed program was a success: ${success}`)).catch(e => console.error(e.message));
}

init();
