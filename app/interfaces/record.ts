export interface Record {
  client: Elasticsearch.Client;
  save(): Promise<any>;
}