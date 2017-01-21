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
    if (isKey(key)) {
      this.key = { ...key };
      this.keyToProperties()
    }
  }

  save(): Promise<any> {
    if (this.properties === undefined) {
      return Promise.reject(`invalid key: key.name: ${this.key.name}, key.type: ${this.key.type}`);
    }
    const properties = this.properties;
    this.client.indices.putMapping({
      index: 'master_screener',
      type: 'queries',
      body: {
        properties
      }
    })
  }

  static getAll(client: Elasticsearch.Client): Promise<Key[]> {
    return client.indices.getMapping({
      index: 'master_screener',
      type: 'queries'
    })
    .then(mapping => {
      const keys = Object.keys(mapping).map(hashKey => {
        return { name: hashKey, type: mapping[hashKey]}
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