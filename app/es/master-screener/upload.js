const
utils  = require('../utils'),
verify = require('./verify');

module.exports = {
  uploadMasterScreenerQuestions
};


async function uploadMasterScreenerQuestions(client, questions) {
  // throws error if invalid
  verify(questions);
  const res = await utils.indexDoc(client, 'questions', questions, 'screener');
  return res;
}
