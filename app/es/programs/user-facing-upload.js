const utils = require('../utils');



// program in this context is the user facing portion
async function handleProgramUpload(client, program, guid) {
  if (client === undefined || program == undefined) {
    throw new Error('program or client undefined in handleProgramUpload');
  }
  if (program.guid === 'new') {
    throw new Error('program guid is not assigned in handleProgramUpload');
  }
  console.log(program.guid);
  const res = await utils.indexDoc(client, 'programs', program, 'user_facing', guid);
  return res;
}

module.exports = {
  handleProgramUpload
};
