const guid = require('node-uuid');

module.exports = {
  applyMetaData
};

function applyGUID(program) {
  if (program.guid === 'new') {
    const newGuid = guid.v4();
    program.guid = newGuid;
    program.application.guid = newGuid;
    program.application.forEach( query => {
      query.guid = newGuid;
    });
  }
  return program;
}

function applyTimestamp(program) {
  if (program.created === '' || program.created === undefined || program.created === 0) {
    program.user.created = (new Date).getTime();
  }
  return program;
}

function applyMetaData(program) {
  applyGUID(program);
  applyTimestamp(program);
  return program;
}
