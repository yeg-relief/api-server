import * as test from 'tape';
import { KeyRecord } from '../../../app/models';
import { Key } from '../../../app/shared';

test('KeyRecord can parse the JSON from getMappings to return all keys in master_screener/queries', t => {
  const indices = <Elasticsearch.Indices>{
    getMapping: (obj: any) => {
      return Promise.resolve({
        "master_screener": {
          "mappings": {
            "queries": {
              "properties": {
                "meta": {
                  "properties": {
                    "id": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    },
                    "program_guid": {
                      "type": "text",
                      "fields": {
                        "keyword": {
                          "type": "keyword",
                          "ignore_above": 256
                        }
                      }
                    }
                  }
                },
                "query": {
                  "type": "percolator"
                },
                "test": {
                  "type": "boolean"
                },
                "income": {
                  "type": "integer"
                }
              }
            }
          }
        }
      })
    }
  }

  const mockClient = {
    indices
  };



  //const keyRecord = new KeyRecord(<Elasticsearch.Client>mockClient, { name: 'test', type: 'boolean' })

  KeyRecord.getAll(<Elasticsearch.Client>mockClient)
    .then( actual => {
      const expected = [ { name: 'test', type: 'boolean' }, {name: 'income', type: 'integer'} ];
      t.deepEqual(actual, expected);
      t.end();
    })
});

test('KeyRecord can perform a putMapping operation to save a key', t => {
  const indices = <Elasticsearch.Indices>{
    putMapping: (obj: any) => {
      return Promise.resolve({
        acknowledged: true,
        shards_acknowledged: true
      })
    }
  };

  const mockClient = {
    indices
  };

  const keyRecord = new KeyRecord(<Elasticsearch.Client>mockClient, { name: 'test', type: 'boolean' })
  const expectedProperties = { test: { type: 'boolean' } }
  t.deepEqual(keyRecord.properties, expectedProperties);

  keyRecord.save().then(actual => {
    t.equal(actual, true);
    t.end();
  })
  
});

test("keyRecord will change uploaded key's type if it is 'number' to 'integer'", t => {
  const key: Key = {
    name: 'married',
    type: 'number'
  };

  const keyRecord = new KeyRecord(undefined, key);
  const expectedProperties = { married: { type: 'integer'} };
  t.deepEqual(keyRecord.properties, expectedProperties);
  t.end();
})