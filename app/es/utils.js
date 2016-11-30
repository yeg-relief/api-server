const PERCOLATOR_CONSTANTS = {
  INDEX: 'master_screener',
  TYPE: 'screener',
  QUERIES: 'queries'
};

module.exports = {
  addPercolator,
  deleteDoc,
  deleteIndex,
  get,
  getMapping,
  indexDoc,
  indexExists,
  initIndex,
  initMapping,
  mappingExists,
  mGet,
  percolateDocument,
  search,
  testConnect,
  CONSTANTS: PERCOLATOR_CONSTANTS
};

/*
  Function names are self-describing.
*/
function deleteIndex(elasticClient, indexName){
  return elasticClient.indices.delete({
    index: indexName
  });
}

function initIndex(elasticClient, indexName, mappings){
  if (mappings === undefined){
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

function indexExists(elasticClient, indexName){
  return elasticClient.indices.exists({
    index: indexName
  });
}

function initMapping(elasticClient, indexName, typeName, properties){
  return elasticClient.indices.putMapping({
    index: indexName,
    type: typeName,
    body: {
      properties
    }
  });
}

function mappingExists(elasticClient, indexName, typeName){
  return elasticClient.indices.existsType({
    index: indexName,
    type: typeName
  });
}

function addPercolator(elasticClient, query, meta){
  if (meta === undefined) {
    throw new Error('attempting to add percolator without meta information');
  }
  return elasticClient.index({
    index: PERCOLATOR_CONSTANTS.INDEX,
    type: PERCOLATOR_CONSTANTS.QUERIES,
    body: {
      query,
      meta
    }
  });
}

function percolateDocument(elasticClient, doc){
  return elasticClient.search({
    index: PERCOLATOR_CONSTANTS.INDEX,
    body: {
      query: {
        percolate: {
          field: 'query',
          document_type: PERCOLATOR_CONSTANTS.TYPE,
          document: doc
        }
      },
      _source: {
        includes: 'meta.*'
      }
    }
  });
}

function indexDoc(elasticClient, indexName, doc, type, id){
  if (type === undefined){
    return elasticClient.index({
      index: indexName,
      body: {
        doc
      }
    });
  }else{
    return elasticClient.index({
      index: indexName,
      type: type,
      id: id,
      body: {
        doc
      }
    });
  }
}

function search(elasticClient, index, type, guid){
  return elasticClient.search({
    index: index,
    type: type,
    body: {
      query: {
        constant_score : {
          filter : {
            term : { guid : guid}
          }
        }
      }
    }

  });
}

function mGet(elasticClient, index, type, ids){
  return elasticClient.mget({
    index: index,
    type: type,
    body: {
      ids
    }
  });
}

function get(elasticClient, index, type, id){
  return elasticClient.get({
    index: index,
    type: type,
    id: id
  });
}

function deleteDoc(elasticClient, index, type, id){
  return elasticClient.delete({
    index: index,
    type: type,
    id: id
  });
}

function getMapping(elasticClient, index, type){
  return elasticClient.indices.getMapping({
    index: index,
    type: type
  });
}

function testConnect(elasticClient) {
  return new Promise(
    (resolve, reject) => {
        elasticClient.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: Infinity,
        // undocumented params are appended to the query string
        hello: 'elasticsearch!'
      }, function (error) {
        if (error) {
          reject(error);
        } else {
          resolve('Elasticsearch Client can connect');
        }
      });
    }
  );
}
