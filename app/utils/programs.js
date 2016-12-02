const
guid          = require('node-uuid'),
escapeElastic = require('elasticsearch-sanitize');

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
  console.log(program);
  applyGUID(program);
  applyTimestamp(program);
  return program;
}

function sanitize(program) {
  let sanitized = sanitizeES(program);
  sanitized = sanitizeSQL(sanitized);
  return sanitized;
}

function sanitizeES(program) {
  // value will appear in the query string
  program.conditions = program.conditions.forEach(condition => {
    condition.value = escapeElastic(condition.value);
  });
  return program;
}

function sanitizeSQL(program) {
  return program;
}
