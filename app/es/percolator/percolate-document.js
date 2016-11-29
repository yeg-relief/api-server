const utils = require('../utils');

module.exports = {
  percolateUserData
};

// percolate the user submitted data from the "master screener" form
async function percolateUserData(client, data) {
  const res = await utils.percolateDocument(client, data);
  return res;
}
