import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';
import { ScreenerRecord, KeyRecord } from '../../models';
import { Screener } from '../../shared';
import 'rxjs/add/operator/toPromise';
import * as Rx from 'rxjs/Rx'

export class AdminScreener {
  constructor(private cache: ScreenerCache, private client: Elasticsearch.Client){}

  getScreener(): RouteHandler {
    return (req, res, next) => {
      const start = Date.now();
      this.setupResponse(res);
      let screener;
      this.cache.get()
        .take(1)
        .do( liftedScreener => screener = liftedScreener )
        .switchMap( _ =>  Rx.Observable.fromPromise(KeyRecord.getAll(this.client)))
        .map( keys => (<any>Object).assign({}, screener, { keys: keys}) )
        .subscribe(
          cachedScreener => res.end(JSON.stringify({ response: cachedScreener })),
          error => KeyHandler.handleError(res, error),
          () => console.log(`[PROTECTED_GET_SCREENER] resolve time: ${Date.now() - start}`)
        )
    }
  }

  saveScreener(): RouteHandler {
    return (req, res, next) => {
      const start = Date.now();
      this.setupResponse(res);
      console.log(req.body.screener);
      const screener = <Screener>req.body.screener;
      const record = new ScreenerRecord(screener, this.client);
      
      Rx.Observable.fromPromise(KeyRecord.getAll(this.client))
        .take(1)
        .map( keys => [record.validateUpload(keys), keys] )
        .do( ([valid, keys]) => console.log(keys))
        .filter( ([valid, keys]) => valid === true)
        .switchMap( ([valid, keys]) => Rx.Observable.of([record.save(), keys]) )
        .filter( ([response, keys]) => response === true )
        .switchMap( ([_, keys]) => Rx.Observable.of([this.cache.update(record), keys]) )
        .map( ([cachedScreener, keys]) => (<any>Object).assign({}, cachedScreener, { keys: keys }) )
        .subscribe(
          newlyUpdated => {
            console.log(newlyUpdated)

            res.end(JSON.stringify({ response: newlyUpdated })) 
          },
          error => KeyHandler.handleError(res, error),
          () => console.log(`[PROTECTED_POST_SCREENER] resolve time: ${Date.now() - start}`)
        )
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}