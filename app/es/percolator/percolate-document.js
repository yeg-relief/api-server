const utils = require('../utils');

module.exports = {
  percolateUserData
};

// percolate the user submitted data from the "master screener" form
// and returns an array of guid "hits"
async function percolateUserData(client, data) {
  const res = await utils.percolateDocument(client, data);
  const guids = res.hits.hits.reduce( (accum, hit) => {
    const guid = hit._source.meta.program_guid;
    return [guid, ...accum];
  }, []);
  return guids;
}
