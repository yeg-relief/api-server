import { Client } from 'elasticsearch'
import { Router } from 'router';
import { MyRouter } from './router';
import * as Caches from './cache';
import * as http from 'http';
import * as finalhandler from 'finalhandler';
import { ScreenerRecord } from './models';
import { Screener } from './shared';

const config: Elasticsearch.ConfigOptions = { host: 'localhost:9200' }
const client: Elasticsearch.Client = new Client(config);

let screenerCache: Caches.ScreenerCache;

function startScreenerCache(client: Elasticsearch.Client): Promise<Caches.ScreenerCache> {

  return client.search<Screener>({
    index: 'questions',
    type: 'screener',
    body: { query: { match_all: {} } } 
  })
  .then(response => {
    if(response.hits.total > 0) {
      return Promise.resolve([...response.hits.hits])
    }
    return Promise.resolve(undefined)
  })
  .then( hits => Promise.resolve(hits.map(h => h._source)))
  .then( sources => {
    const sorted = sources.sort((a, b) => a.version - b.version);
    return Promise.resolve((<any>sorted[0]).doc);
  })
  .then<Caches.ScreenerCache>( (screenerSeed: any) => {
    const seed = new ScreenerRecord(screenerSeed, client);
    return Promise.resolve(new Caches.ScreenerCache(seed))
  })
  .catch(error => {
    console.error('unable to intiate screenerCache');
    console.error(error.message);
    process.exit(0)
  })
}

let server;

startScreenerCache(client)
  .then(screenerCache => {
    const myRouter = new MyRouter(client, screenerCache);
    server = http.createServer((req, res) => {
      myRouter.router(req, res, finalhandler(req, res))
    })
    server.listen(3000);
  })



