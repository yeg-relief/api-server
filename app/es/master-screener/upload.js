const
utils  = require('../utils'),
verify = require('./verify');

module.exports = {
  uploadMasterScreenerQuestions
};


async function uploadMasterScreenerQuestions(client, questions) {
  // program.user.created = (new Date).getTime();
  questions.meta.screener.created = (new Date).getTime();
  questions.meta.questions.totalCount = questions.questions.length;
  verify.verify(questions);
  const res = await utils.indexDoc(client, 'questions', questions, 'screener');
  return res;
}
