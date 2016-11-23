const
utils         = require('./utils'),
elasticsearch = require('elasticsearch');

const emptyMapping = {
};

const percolatorMapping = {
  'query': {
      'type': 'percolator'
    }
};


// will clear index if it exists
async function seed(client, host = 'localhost:9200') {
  const driver = client || elasticsearch.Client({host: host});

  // delete index if exists, add empty mapping for screener type
  const indexExists = await utils.indexExists(driver, utils.CONSTANTS.INDEX);
  if (indexExists) {
    await utils.deleteIndex(driver, utils.CONSTANTS.INDEX);
  }
  await utils.initIndex(driver, utils.CONSTANTS.INDEX);
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-percolate-query.html
  // add mapping for screener type
  await utils.initMapping(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE, emptyMapping);
  // add mapping for percolator/query type
  await utils.initMapping(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.QUERIES, percolatorMapping);
  // ensure the mappings exist
  const screenerExists = await utils.mappingExists(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE);
  if (!screenerExists) {
    throw new Error('screener mapping does not exist');
  }
  const queriesExists = await utils.mappingExists(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.QUERIES);
  if (!queriesExists) {
    throw new Error('query mapping does not exist');
  }
  return true;
}

function init(){
  seed().then(success => console.error(`seed program was a success: ${success}`)).catch(e => console.error(e.message));
}

init();
