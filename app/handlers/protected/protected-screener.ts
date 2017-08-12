import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';
import { ScreenerRecord, KeyRecord } from '../../models';
import { Screener } from '../../shared';
import * as Rx from 'rxjs/Rx'

export class AdminScreener {
  constructor(private cache: ScreenerCache, private client: Elasticsearch.Client){}

  getScreener(): RouteHandler {
    return (req, res) => {
      this.setupResponse(res);
      let screener;
      this.cache.get()
        .take(1)
        .do( liftedScreener => screener = liftedScreener )
        .flatMap( _ =>  Rx.Observable.fromPromise(KeyRecord.getAll(this.client)))
        .map( keys => (<any>Object).assign({}, screener, { keys: keys}) )
        .subscribe(
          cachedScreener => res.end(JSON.stringify({ response: cachedScreener })),
          error => KeyHandler.handleError(res, error),
        )
    }
  }

  saveScreener(): RouteHandler {
    return (req, res) => {
      this.setupResponse(res);
      const screener = <Screener>req.body;
      const record = new ScreenerRecord(screener, this.client);
      let keys = [];

      console.log('==================');
      console.log(screener);
      console.log(record);
      console.log('==================');

      Rx.Observable.fromPromise(KeyRecord.getAll(this.client))
        .take(1)
        .filter( keys => record.validateUpload(keys) )
        .do( (liftedKeys) => keys = liftedKeys )
        .flatMap( _ => Rx.Observable.fromPromise(record.save()) )
        .filter( response => response.created === true )
        .flatMap( _ => this.cache.update(record) )
        .map( cachedScreener => (<any>Object).assign({}, cachedScreener, { keys: keys }) )
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