const guid = require('node-uuid');

module.exports = {
  applyMetaData,
  applicationToConditions
};

function applyGUID(program) {
  if (program.guid === 'new') {
    const newGuid = guid.v4();
    program.guid = newGuid;
    program.application.guid = newGuid;
    program.application.forEach(query => {
      query.guid = newGuid;
    });
    program.user.guid = newGuid;

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

/*
export interface ProgramCondition {
  key: Key;
  value: boolean | string | number;
  type: 'boolean' | 'text' | 'number';
  qualifier?: string | 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';
}

export interface Key {
  name: string;
  type: string;
}

*/
function applicationToConditions(programApplication) {
  return programApplication.reduce((accum, program) => {
    return [{ id: program.id, query: [...transformToConditions(program.query.bool.must)]}, ...accum];
  }, [])
}

/*
bool: {
  must: [
    // lessThan
    {
      range: {
        income: {
          lt: 10
        }
      }
    },
    // equal
    {
      term: {
        age: 10
      }
    }
  ]
}	
*/
// programCondition is the 'must' array
function transformToConditions(mustQueries) {
  const conditions = [];
  mustQueries.forEach(query => {
    const condition = { key: {} };
    const {keyName, keyType} = extractKey(query);
    condition.key.name = keyName;
    condition.key.type = keyType;
    if (condition.key.type === 'number') {
      condition.qualifier = qualifier(condition.key.name, condition.key.type, query);
    }

    condition.value = getKeyValue(condition.key.name, query);
    conditions.push(condition);
  })
  return conditions;
}

function extractKey(query) {

  const getKeyName = (query) => {
    let queryKey; // will be an array due to Object.keys ... length should not be greater than 1
    if (query['term'] !== undefined) {
      queryKey = Object.keys(query['term']);
    } else if (query['range'] !== undefined) {
      queryKey = Object.keys(query['range']);
    }
    if (queryKey.length > 1) {
      throw new Error('too many terms in query');
    }
    return queryKey[0];
  }

  const getKeyType = (key, query) => {
    return typeof getKeyValue(key, query);
  }

  const keyName = getKeyName(query);
  const keyType = getKeyType(keyName, query);
  return {
    keyName,
    keyType
  };
}

function qualifier(keyName, keyType, query) {
  if (keyType === 'boolean') {
    return undefined;
  }
  // keyName is of number type so it will be a range or equal
  const container = extractEScontainer(query);
  if (container === 'range') {
    const rawQualifier = getRawQualifier(keyName, query);
    switch (rawQualifier) {
      case 'lt': return 'lessThan';

      case 'lte': return 'lessThanOrEqual';

      case 'gt': return 'greaterThan';

      case 'gte': return 'greaterThanOrEqual';

      default: {
        return undefined;
      }
    }
  } else if (container === 'term') {
    return 'equal';
  }
  else {
    return undefined;
  }
}

function getKeyValue(keyName, query) {
  let keyValue;
  if (query['term'] !== undefined) {
    keyValue = query['term'][keyName];
  } else if (query['range'] !== undefined) {
    const rangeContainer = query['range'][keyName];
    const containerKey = Object.keys(rangeContainer)[0];
    keyValue = rangeContainer[containerKey];
  }
  return keyValue;
}

function getRawQualifier(keyName, query) {
  let qualifier;
  if (query['term'] !== undefined) {
    return undefined;
  }
  if (query['range'] !== undefined) {
    return Object.keys(query['range'][keyName])[0];
  }
}


function extractEScontainer(query) {
  if (query['term'] !== undefined) {
    return 'term';
  } else if (query['range'] !== undefined) {
    return 'range';
  }
  return undefined;
}

