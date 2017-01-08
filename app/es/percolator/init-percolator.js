const utils = require('../utils');

/*
  This module adds new queries for a program to ES.
  Queries must be processed before 'coming' here, this processing includes:
    * generating a guid for each query
    * ensuring queries are well formed
    * deduplicating queries... done on client side but double checked here
*/
module.exports = {
  addQueries,
  updateQueries,
  deleteQueries,
  test: {
    AppQueryESqueryConverter,
    parseNumberCondition,
    parseQualifiedNumberCondition,
    parseBooleanCondition,
  }
};

// the query structure in our app is different than the query structure used
// by ES. Need to convert between the two.
function AppQueryESqueryConverter(applicationQuery) {
  // could use a filter. Most likely negligible improvement for our small dataset
  const convertedQuery = {
    bool: {
      must: []
    }
  };
  // build our query from the conditions associate with the program
  convertedQuery.bool.must = applicationQuery.conditions.reduce((accum, condition) => {
    switch (condition.type) {
      case 'number': {
        if (condition.qualifier === undefined) {
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

async function addQueries(client, queries, programGUID) {
  const promises = queries.reduce((accum, query) => {
    const convertedQuery = AppQueryESqueryConverter(query);
    const meta = {
      program_guid: programGUID
    };
    const promise = utils.addPercolator(client, convertedQuery, meta);
    return [promise, ...accum];
  }, []);
  const response = await Promise.all(promises);
  return response;
}

async function updateQueries(client, queries, programGUID) {
  const promises = queries.reduce((accum, query) => {
    const convertedQuery = AppQueryESqueryConverter(query);
    const meta = {
      program_guid: programGUID
    };
    let promise;
    if (query.id.substring(0,4) === 'temp') {
      promise = utils.addPercolator(client, convertedQuery, meta);
    } else {
      promise = utils.updatePercolator(client, convertedQuery, meta, query.id);
    }
    return [promise, ...accum];
  }, []);
  const response = await Promise.all(promises);
  return response;
}

async function deleteQueries(client, ids) {
  const promises = ids.reduce((accum, id) => {
    const promise = utils.deletePercolator(client, id);
    return [promise, ...accum];
  }, []);
  const response = await Promise.all(promises);
  return response;
}