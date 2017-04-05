import { Key, isKey } from '../shared';
import { Record } from '../interfaces';
/*
  NOTE:
  deleting a key is not straightforward, this is a list of sources to investigate.
  http://stackoverflow.com/a/38874129/764384
  https://www.elastic.co/guide/en/elasticsearch/reference/2.3/docs-reindex.html
  https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html
*/


export class KeyRecord implements Record {
  client: Elasticsearch.Client;
  key: Key;
  properties = undefined;

  constructor(client: Elasticsearch.Client, key: Key) {
    this.client = client;
    this.key = { ...key };
    // this is to deal with a version of the client application that uses 
    // 'number' instead of 'integer'
    if (key.type !== 'integer' && key.type !== 'boolean') {
      this.key.type = 'integer';
    }
    this.keyToProperties()

  }

  save(): Promise<any> {
    if (this.properties === undefined) {
      return Promise.reject(`invalid key: key.name: ${this.key.name}, key.type: ${this.key.type}`);
    }

    const properties = this.properties;
    return this.client.indices.putMapping({
      index: 'master_screener',
      type: 'queries',
      body: {
        properties
      }
    })
    .then(response => {
      if (response.acknowledged !== undefined){
        return Promise.resolve(response.acknowledged);
      }
      return Promise.reject(response.acknowledged);
    })
  }

  static getAll(client: Elasticsearch.Client): Promise<Key[]> {
    return client.indices.getMapping({
      index: 'master_screener',
      type: 'queries'
    })
      .then(mapping => {
        const properties = mapping.master_screener.mappings.queries.properties;
        const keys = Object.keys(properties)
          .filter(hashKey => hashKey !== 'query' && hashKey !== 'meta')
          .map(hashKey => {
            return { name: hashKey, type: properties[hashKey]['type'] }
          })
        return Promise.resolve(keys);
      });
  }

  private keyToProperties() {
    this.properties = {};
    this.properties[this.key.name] = {};
    this.properties[this.key.name].type = this.key.type;
  }
}