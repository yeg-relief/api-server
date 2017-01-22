import { Client } from 'elasticsearch'
import { Router } from 'router';
import { MyRouter } from './router';
import * as Caches from './cache';
import * as http from 'http';
import * as finalhandler from 'finalhandler';
import * as Rx from 'rxjs/Rx';
import { ScreenerRecord, UserProgramRecord } from './models';
import { Screener } from './shared';

const config: Elasticsearch.ConfigOptions = { host: 'localhost:9200' }
const client: Elasticsearch.Client = new Client(config);

let screenerCache: Caches.ScreenerCache;
let programCache: Caches.ProgramCache;

function startScreenerCache(client: Elasticsearch.Client) {

  const inner = client.search<Screener>({
    index: 'questions',
    type: 'screener',
    body: { query: { match_all: {} } } 
  })
  .then(response => [...response.hits.hits])
  .then( hits => hits.map(h => h._source))
  .then<Screener[]>( sources => {
    const sorted = sources.sort((a, b) => a.version - b.version);
    return Promise.resolve((<any>sorted[0]).doc);
  })
  .then<Caches.ScreenerCache>( (screenerSeed: any) => {
    const seed = new ScreenerRecord(screenerSeed, client);
    return Promise.resolve(new Caches.ScreenerCache(seed))
  })

  return inner;
}

function startProgramCache(client: Elasticsearch.Client) {
  return Rx.Observable.fromPromise(UserProgramRecord.getAll(client))
    .do(() => console.log('here 1'))
    .map(programs => programs.map(program => new UserProgramRecord(program, client)))
    .do((thing) => console.log('here 3'))
    .map((programs: UserProgramRecord[]) => new Caches.ProgramCache(programs))
    .toPromise();
}


let server;


startScreenerCache(client)
  .then( screenerCache => Promise.all([Promise.resolve(screenerCache), startProgramCache(client)]))
  .then( ([screenerCache, programCache]) => Promise.resolve(new MyRouter(client, screenerCache, programCache)))
  .then( myRouter => {
    server = http.createServer( (req, res) => {
      return myRouter.router(req, res, finalhandler(req, res))
    })
  })
  .then( _ => server.listen(3000))
  .catch( error => {
    console.error(error.message);
    process.exit(0);
  })





