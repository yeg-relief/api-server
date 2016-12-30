const guid = require('node-uuid');

module.exports = {
  applyMetaData
};

function applyGUID(program) {
  console.log('in applyGUID')
  console.log(program)
  console.log('================')
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
function transformToCondition(mustQueries) {
  const conditions = [];
  mustQueries.forEach(query => {
    const condition = {};
    extractKey(condition, query);

  })
}

function extractKey(condition, query) {
  const getKeyName = () => {
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

  const getKeyType = (key) => {
    let keyValue;
    if (query['term'] !== undefined) {
      keyValue = query['term'].key;
    } else if (query['range'] !== undefined) {
      const rangeContainer = query['range'].key
      const containerKey = Object.keys(rangeContainer)[0];
      keyValue = rangeContainer[containerKey];
    }

    return typeof keyValue;
  } 

  const keyName = getKeyName();
  const keyType = getKeyType(keyName);
  return {
    name: keyName,
    type: keyType
  };
}