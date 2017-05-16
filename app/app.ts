import { Client } from 'elasticsearch'
import { Router } from 'router';
import { MyRouter } from './router';
import * as Caches from './cache';
import { NotificationEngine } from './notification-engine';
import * as http from 'http';
import * as finalhandler from 'finalhandler';
import * as Rx from 'rxjs/Rx';
import { ScreenerRecord, UserProgramRecord } from './models';
import { Screener } from './shared';


const PAGE_SIZE = 200;
const config: Elasticsearch.ConfigOptions = { host: 'localhost:9200' }
const client: Elasticsearch.Client = new Client(config);

let server: http.Server;

const blankScreener: Screener = {
  created: 0,
  questions: [],
  conditionalQuestions: []
}


function startScreenerCache(client: Elasticsearch.Client) {

  const inner = client.search<Screener>({
    index: 'questions',
    type: 'screener',
    size: PAGE_SIZE,
    body: { query: { match_all: {} } } 
  })
  .then(response => [...response.hits.hits])
  .then( hits => hits.map(h => h._source))
  .then<Screener>( sources => {

    const sorted = sources.sort((a, b) => b.created - a.created);

    return sorted[0] === undefined ? Promise.resolve(blankScreener) : Promise.resolve(sorted[0]);
  })
  .then<Caches.ScreenerCache>( (screenerSeed: Screener) => {
    const seed = new ScreenerRecord(screenerSeed, client);
    return Promise.resolve(new Caches.ScreenerCache(seed))
  })

  return inner;
}

function startProgramCache(client: Elasticsearch.Client) {
  return Rx.Observable.fromPromise(UserProgramRecord.getAll(client))
    .map(programs => programs.map(program => new UserProgramRecord(program, client)))
    .map((programs: UserProgramRecord[]) => new Caches.ProgramCache(programs))
    .toPromise();
}

function startNotificationEngine(client: Elasticsearch.Client, programCache: Caches.ProgramCache) {
  return Rx.Observable.of(new NotificationEngine(client, programCache)).toPromise();
}





startScreenerCache(client)
  .then( screenerCache => Promise.all([Promise.resolve(screenerCache), startProgramCache(client)]))
  .then( ([screenerCache, programCache]) => Promise.resolve(Promise.all([
      Promise.resolve(screenerCache),
      Promise.resolve(programCache),
      Promise.resolve(startNotificationEngine(client, programCache))
    ])
  ))
  .then( ([screenerCache, programCache, notificationEngine]) => {
    return Promise.resolve(new MyRouter(client, screenerCache, programCache, notificationEngine))
  })
  .then( myRouter => {
    server = http.createServer( (req, res) => {
      return myRouter.router(req, res, finalhandler(req, res))
    })
  })
  .then( _ => server.listen(3000))
  .then(() => console.log('server started on port 3000'))
  .catch( error => {
    console.error(error.message);
    process.exit(0);
  })





