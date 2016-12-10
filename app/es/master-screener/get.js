const
utils  = require('../utils');

module.exports = {
  getAll,
  getVersion
};

async function getAll(client) {
  const res = await utils.search(client, 'questions', 'screener', { match_all: {} } );
  if ( res.hits.total > 0) {
    const docs = [];
    res.hits.hits.forEach( hit => {
      docs.push(hit._source.doc);
    });
    return docs;
  }
  return [];
}

async function getVersion(client, version) {
  /*
  "query": {
    "constant_score" : {
      "filter" : {
        "term" : {  "version" : version }
      }
    }
  }
  */
  // I can't figure out the query right now... will use match all and integrate
  // a cache, but it should be noted that this function is not efficient.
  const query = {
    match_all: {}
  };
  const res = await utils.search(client, 'questions', 'screener', query);
  if (res.hits.total > 0) {
    return res.hits.hits
            .filter( hit => hit._source.doc.version === parseInt(version, 10))
            .map(hit => hit._source.doc);
  }
  return [];
}
