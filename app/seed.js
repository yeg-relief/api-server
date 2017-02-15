const elasticsearch = require('elasticsearch');


const CONSTANTS = {
  INDEX: 'master_screener',
  TYPE: 'screener',
  QUERIES: 'queries'
};


const emptyMapping = {
};

const percolatorMapping = {
  query: {
      type: 'percolator'
    }
};

const programMapping = {
  title: { type: 'string'},
  externalLink: { type: 'string'},
  tags: { type: 'keyword'},
  created: { type: 'date' }
};

function deleteIndex(elasticClient, indexName) {
  return elasticClient.indices.delete({
    index: indexName
  });
}

function initIndex(elasticClient, indexName, mappings) {
  if (mappings === undefined) {
    return elasticClient.indices.create({
      index: indexName
    });
  }
  return elasticClient.indices.create({
    index: indexName,
    body: {
      mappings
    }
  });
}

function indexExists(elasticClient, indexName) {
  return elasticClient.indices.exists({
    index: indexName
  });
}

function initMapping(elasticClient, indexName, typeName, properties) {
  return elasticClient.indices.putMapping({
    index: indexName,
    type: typeName,
    body: {
      properties
    }
  });
}

function mappingExists(elasticClient, indexName, typeName) {
  return elasticClient.indices.existsType({
    index: indexName,
    type: typeName
  });
}



// TODO: make less procedural
// note: creating these index and mappings isn't strictly required, but we may, or will, want to change the default settings
// we don't really need replicas or shards.
async function seed(host = 'localhost:9200') {
  const driver = elasticsearch.Client({host: host});

  // delete index if exists, add empty mapping for screener type
  const masterScreenerIndexExists = await indexExists(driver, CONSTANTS.INDEX);
  if (masterScreenerIndexExists) {
    await deleteIndex(driver, CONSTANTS.INDEX);
  }
  let programsIndexExists = await indexExists(driver, 'programs');
  if (programsIndexExists) {
    await deleteIndex(driver, 'programs');
  }
  const questionsIndexExists = await indexExists(driver, 'questions');
  if (questionsIndexExists) {
    await deleteIndex(driver, 'questions');
  }

  await initIndex(driver, CONSTANTS.INDEX);
  // https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-percolate-query.html
  // add mapping for screener type
  await initMapping(driver, CONSTANTS.INDEX, CONSTANTS.TYPE, emptyMapping);
  // add mapping for percolator/query type
  await initMapping(driver, CONSTANTS.INDEX, CONSTANTS.QUERIES, percolatorMapping);

  // ensure "master-screener" index exists
  const screenerIndexExists = await indexExists(driver, CONSTANTS.INDEX);
  if (!screenerIndexExists) {
    throw new Error('unable to set up screener index');
  }

  // create mappings
  const screenerMappingExists = await mappingExists(driver, CONSTANTS.INDEX, CONSTANTS.TYPE);
  const queriesExists = await mappingExists(driver, CONSTANTS.INDEX, CONSTANTS.QUERIES);
  if (!screenerMappingExists) {
    throw new Error('screener mapping does not exist');
  }

  if (!queriesExists) {
    throw new Error('query mapping does not exist');
  }
  // we will rely on dynamic mappings for the programs index
  await initIndex(driver, 'programs');
  programsIndexExists = await indexExists(driver, 'programs');
  if (!programsIndexExists) {
    throw new Error('unable to set up programs index');
  }
  await initMapping(driver, 'programs', 'user_facing', programMapping);
  const userProgrammingMappingExists = await mappingExists(driver, 'programs', 'user_facing');
  if (!userProgrammingMappingExists) {
    throw new Error('unable to map programs/user_facing');
  }

  // index for the question set (or master screener)
  await initIndex(driver, 'questions');

  return true;
}

function main(){
  seed().then(success => console.log(`seed program was a success: ${success}`)).catch(e => console.error(e.message));
}

main();
