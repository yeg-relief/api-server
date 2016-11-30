const
utils         = require('./utils'),
elasticsearch = require('elasticsearch');

const emptyMapping = {
};

const percolatorMapping = {
  query: {
      type: 'percolator'
    }
};

const programMapping = {
  guid: {
    type: 'keyword',
  },
  created: {
    type: 'date'
  },
  tags: {
    type: 'keyword',
  }
};


// TODO: make less procedural
async function seed(client, host = 'localhost:9200') {
  const driver = client || elasticsearch.Client({host: host});

  // delete index if exists, add empty mapping for screener type
  const masterScreenerIndexExists = await utils.indexExists(driver, utils.CONSTANTS.INDEX);
  if (masterScreenerIndexExists) {
    await utils.deleteIndex(driver, utils.CONSTANTS.INDEX);
  }
  let programsIndexExists = await utils.indexExists(driver, 'programs');
  if (programsIndexExists) {
    await utils.deleteIndex(driver, 'programs');
  }


  await utils.initIndex(driver, utils.CONSTANTS.INDEX);
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-percolate-query.html
  // add mapping for screener type
  await utils.initMapping(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE, emptyMapping);
  // add mapping for percolator/query type
  await utils.initMapping(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.QUERIES, percolatorMapping);

  // ensure "master-screener" index exists
  const screenerIndexExists = await utils.indexExists(driver, utils.CONSTANTS.INDEX);
  if (!screenerIndexExists) {
    throw new Error('unable to set up screener index');
  }

  // create mappings
  const screenerMappingExists = await utils.mappingExists(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.TYPE);
  const queriesExists = await utils.mappingExists(driver, utils.CONSTANTS.INDEX, utils.CONSTANTS.QUERIES);
  if (!screenerMappingExists) {
    throw new Error('screener mapping does not exist');
  }

  if (!queriesExists) {
    throw new Error('query mapping does not exist');
  }
  // we will rely on dynamic mappings for the programs index
  await utils.initIndex(driver, 'programs');
  programsIndexExists = await utils.indexExists(driver, 'programs');
  if (!programsIndexExists) {
    throw new Error('unable to set up programs index');
  }
  await utils.initMapping(driver, 'programs', 'user_facing', programMapping);
  const userProgrammingMappingExists = await utils.mappingExists(driver, 'programs', 'user_facing');
  if (!userProgrammingMappingExists) {
    throw new Error('unable to map programs/user_facing');
  }
  return true;
}

function main(){
  seed().then(success => console.log(`seed program was a success: ${success}`)).catch(e => console.error(e.message));
}

main();
