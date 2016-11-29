const
guid          = require('node-uuid'),
escapeElastic = require('elasticsearch-sanitize');

module.exports = {
  applyGUID,
  sanitize
};

function applyGUID(program) {
  if (program.guid === 'new') {
    const newGuid = guid.v4();
    program.guid = newGuid;
    program.application.guid = newGuid;
    program.application.forEach( query => {
      query.guid = newGuid;
    });
    program.user.guid = newGuid;
    program.user.description.guid = newGuid;
  }
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
