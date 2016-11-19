const
utils         = require('./utils'),
elasticsearch = require('elasticsearch');

const emptyMapping = Object.create(null);
emptyMapping[utils.CONSTANTS.TYPE] = {
  properties: {}
};


// will clear index if it exists
async function seed(client) {
  const driver = client || elasticsearch.Client({host: 'localhost:9200'});
  await utils.testConnect(driver);
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
