import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';
import { ScreenerRecord, KeyRecord } from '../../models';
import { Screener } from '../../shared';
import * as Rx from 'rxjs/Rx'

export class AdminScreener {
  constructor(private cache: ScreenerCache, private client: Elasticsearch.Client){}

  getScreener(): RouteHandler {
    return (req, res, next) => {
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
        )
    }
  }

  saveScreener(): RouteHandler {
    return (req, res, next) => {
      const start = Date.now();
      this.setupResponse(res);
      const screener = <Screener>req.body.screener;
      const record = new ScreenerRecord(screener, this.client);
      let keys = []

      Rx.Observable.fromPromise(KeyRecord.getAll(this.client))
        .take(1)
        .filter( keys => record.validateUpload(keys) )
        .do( (liftedKeys) => keys = liftedKeys )
        .switchMap( _ => Rx.Observable.fromPromise(record.save()) )
        .filter( response => response.created === true )
        .switchMap( _ => this.cache.update(record) )
        .map( cachedScreener => (<any>Object).assign({}, cachedScreener, { keys: keys }) )
        .timeout(10000)
        .subscribe(
          newlyUpdated => res.end(JSON.stringify({ response: newlyUpdated })),
          error => KeyHandler.handleError(res, error),
        )
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}