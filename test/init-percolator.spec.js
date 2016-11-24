const
expect = require('chai').expect,
initPercolator = require('../app/es/percolator/init-percolator');

describe('initPercolator.test is a set of functions that focus on converting our Application Query to a proper ES Query', function() {
  it('\ncan form a proper boolean query', function() {
    const query = {
      guid: 'mock',
      id: '10',
      conditions: [
        {
          key: {
            name: 'married',
            type: 'boolean'
          },
          value: true,
          type: 'boolean'
        }
      ]
    };
    const expected = {
      query: {
        bool: {
          must: [
            {
              term: {
                married: true
              }
            }
          ]
        }
      }
    };
    const actual = initPercolator.modules.test.AppQueryESqueryConverter(query);
    expect(expected).to.deep.equal(actual);
  });

  it('\ncan form a proper number query', function() {
    const query = {
      guid: 'mock',
      id: '10',
      conditions: [
        {
          key: {
            name: 'age',
            type: 'number'
          },
          value: 10,
          qualifier: 'lessThan',
          type: 'number'
        }
      ]
    };

    const expected = {
      query: {
        bool: {
          must: [
            {
              range: {
                age: {
                  lt: 10
                }
              }
            }
          ]
        }
      }
    };
    const actual = initPercolator.modules.test.AppQueryESqueryConverter(query);
    expect(expected).to.deep.equal(actual);
  });
});
