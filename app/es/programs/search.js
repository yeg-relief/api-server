const utils = require('../utils');

// program in this context is the user facing portion
async function searchProgramByGuid(client, guids) {
  const hits = await utils.mGet(client, 'programs', 'user_facing', guids);
  // gross naming
  console.error(hits);
  const programs = hits.docs.reduce( (accum, hit) => {
    return [hit._source.doc, ...accum];
  }, []);
  return programs;
}

module.exports = {
  searchProgramByGuid
};
