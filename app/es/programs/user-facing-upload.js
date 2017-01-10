const utils = require('../utils');

// program in this context is the user facing portion
async function handleProgramUpload(client, program, guid) {
  // add value in there for conformity with rest of program
  const valueProgram = Object.create(null);
  valueProgram['value'] = program;
  if (client === undefined || program == undefined) {
    throw new Error('program or client undefined in handleProgramUpload');
  }
  const res = await utils.indexDoc(client, 'programs', valueProgram, 'user_facing', guid);
  return res;
}

module.exports = {
  handleProgramUpload
};
