import { ProgramQuery, NumberCondition, Condition } from '../shared'

export function queryToES(query: ProgramQuery) {
  const convertedQuery = {
    bool: {
      must: []
    }
  };
  // build our query from the conditions associate with the program
  convertedQuery.bool.must = query.conditions.reduce((accum, condition: Condition) => {
    // new conditions may not be assigned type on client side
    if (condition.key.type === undefined) {
      return undefined;
    }
    switch (condition.key.type) {
      case 'integer': {
        if ((<NumberCondition>condition).qualifier === undefined) {
          throw new Error('condition type number with qualifier undefined');
        }
        const numberCondition = parseNumberCondition(condition);
        return [numberCondition, ...accum];
      }
      case 'boolean': {
        const boolCondition = parseBooleanCondition(condition);
        return [boolCondition, ...accum];
      }
      default: {
        return accum;
      }
    }
  }, []);
  return convertedQuery;
}

function parseNumberCondition(condition) {
  if (condition.qualifier === undefined) {
    throw new Error('conditon qualifier undefined');
  } else if (condition.qualifier === 'equal') {
    const obj = { term: {} };
    obj.term[condition.key.name] = condition.value;
    return obj;
  } else {
    // have to call a more complex function to deal with < "less than",
    // >= "greater than or equal" etc. cases
    return parseQualifiedNumberCondition(condition);
  }
}

function parseQualifiedNumberCondition(condition) {
  const obj = { range: {} };
  // return statements are 'hidden' in these cases
  switch (condition.qualifier) {
    case 'lessThan': {
      obj.range[condition.key.name] = {
        lt: condition.value
      };
      return obj;
    }
    case 'lessThanOrEqual': {
      obj.range[condition.key.name] = {
        lte: condition.value
      };
      return obj;
    }
    case 'greaterThanOrEqual': {
      obj.range[condition.key.name] = {
        gte: condition.value
      };
      return obj;
    }
    case 'greaterThan': {
      obj.range[condition.key.name] = {
        gt: condition.value
      };
      return obj;
    }
    default: {
      throw new Error(`number condition without qualifier key: ${condition.key.name}, value: ${condition.key.value}`);
    }
  }
}

function parseBooleanCondition(condition) {
  const obj = { term: {} };
  obj.term[condition.key.name] = condition.value;
  return obj;
}


export function EsToQuery(programApplication) {
  return programApplication.reduce((accum, program) => {
    return [{ id: program.id, conditions: [...transformToConditions(program.query.bool.must)]}, ...accum];
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
    const condition = { key: {name: undefined, type: undefined}, qualifier: undefined, value: undefined };
    const {keyName, keyType} = extractKey(query);
    condition.key.name = keyName;
    condition.key.type = keyType;
    if (condition.key.type === 'number') {
      condition.qualifier = qualifier(condition.key.name, condition.key.type, query);
    } else {
      condition.qualifier = undefined;
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