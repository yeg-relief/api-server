const
guid          = require('node-uuid'),
escapeElastic = require('elasticsearch-sanitize');

module.exports = {
  applyGUID,
  sanitize
};

function applyGUID(program) {
  if (program.guid === 'new') {
    Object.assign(program, {
      guid: guid.v4()
    });
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
