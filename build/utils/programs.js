var guid = require('node-uuid');
module.exports = {
    applyMetaData: applyMetaData,
    applicationToConditions: applicationToConditions
};
function applyGUID(program) {
    if (program.guid === 'new') {
        var newGuid_1 = guid.v4();
        program.guid = newGuid_1;
        program.application.guid = newGuid_1;
        program.application.forEach(function (query) {
            query.guid = newGuid_1;
        });
        program.user.guid = newGuid_1;
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
    return programApplication.reduce(function (accum, program) {
        return [{ id: program.id, conditions: transformToConditions(program.query.bool.must).slice() }].concat(accum);
    }, []);
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
    var conditions = [];
    mustQueries.forEach(function (query) {
        var condition = { key: {} };
        var _a = extractKey(query), keyName = _a.keyName, keyType = _a.keyType;
        condition.key.name = keyName;
        condition.key.type = keyType;
        if (condition.key.type === 'number') {
            condition.qualifier = qualifier(condition.key.name, condition.key.type, query);
        }
        condition.value = getKeyValue(condition.key.name, query);
        conditions.push(condition);
    });
    return conditions;
}
function extractKey(query) {
    var getKeyName = function (query) {
        var queryKey; // will be an array due to Object.keys ... length should not be greater than 1
        if (query['term'] !== undefined) {
            queryKey = Object.keys(query['term']);
        }
        else if (query['range'] !== undefined) {
            queryKey = Object.keys(query['range']);
        }
        if (queryKey.length > 1) {
            throw new Error('too many terms in query');
        }
        return queryKey[0];
    };
    var getKeyType = function (key, query) {
        return typeof getKeyValue(key, query);
    };
    var keyName = getKeyName(query);
    var keyType = getKeyType(keyName, query);
    return {
        keyName: keyName,
        keyType: keyType
    };
}
function qualifier(keyName, keyType, query) {
    if (keyType === 'boolean') {
        return undefined;
    }
    // keyName is of number type so it will be a range or equal
    var container = extractEScontainer(query);
    if (container === 'range') {
        var rawQualifier = getRawQualifier(keyName, query);
        switch (rawQualifier) {
            case 'lt': return 'lessThan';
            case 'lte': return 'lessThanOrEqual';
            case 'gt': return 'greaterThan';
            case 'gte': return 'greaterThanOrEqual';
            default: {
                return undefined;
            }
        }
    }
    else if (container === 'term') {
        return 'equal';
    }
    else {
        return undefined;
    }
}
function getKeyValue(keyName, query) {
    var keyValue;
    if (query['term'] !== undefined) {
        keyValue = query['term'][keyName];
    }
    else if (query['range'] !== undefined) {
        var rangeContainer = query['range'][keyName];
        var containerKey = Object.keys(rangeContainer)[0];
        keyValue = rangeContainer[containerKey];
    }
    return keyValue;
}
function getRawQualifier(keyName, query) {
    var qualifier;
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
    }
    else if (query['range'] !== undefined) {
        return 'range';
    }
    return undefined;
}
