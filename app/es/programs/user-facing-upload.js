const utils = require('../utils');



// program in this context is the user facing portion
async function handleProgramUpload(client, program) {
  if (client === undefined || program == undefined) {
    throw new Error('program or client undefined in handleProgramUpload');
  }
  if (program.guid === 'new') {
    throw new Error('program guid is not assigned in handleProgramUpload');
  }
  const res = await utils.indexDoc(client, 'programs', program, 'user_facing', program.guid);
  return res;
}

module.exports = {
  handleProgramUpload
};
