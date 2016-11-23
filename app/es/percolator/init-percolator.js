const utils = require('../utils');

module.exports = {
  initPercolators
};
/**
  @param {string} indexName - the name of the index to initialize.
  @return {Promise.all}
 */

 /* from client code:
   export interface ProgramQuery {
    guid: string;
    id: string;
    conditions: ProgramCondition[];
  }
  */
async function initPercolators(elasticClient, queries = []) {
  const promises = queries.reduce( (accum, query) => {
    accum.push(utils.addPercolator(elasticClient, utils.CONSTANTS.INDEX, query.guid, query.query));
    return accum;
  }, []);
  const queries = Promise.all(promises);
  const runQueries = await queries;
  return runQueries;
}
