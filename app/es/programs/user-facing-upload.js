const utils = require('../utils');

// program in this context is the user facing portion
async function handleProgramUpload(client, program, guid) {
  console.log(program);
  if (client === undefined || program == undefined) {
    throw new Error('program or client undefined in handleProgramUpload');
  }
  const res = await utils.indexDoc(client, 'programs', program.value, 'user_facing', guid);
  return res;
}

module.exports = {
  handleProgramUpload
};
