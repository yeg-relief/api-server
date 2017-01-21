import { MasterScreenerRecord } from '../models';
import * as Rx from 'rxjs/Rx';

const TIMEOUT_VALUE = 100;

export class ScreenerCache {
  private cache: Rx.ReplaySubject<string>;

  constructor(cacheSeed: MasterScreenerRecord) {
    this.cache = new Rx.ReplaySubject<string>(1);
    this.cache.next(cacheSeed.serialize());
  }

  get(): Rx.Observable<string> {
    return this.cache.asObservable().take(1).timeout(TIMEOUT_VALUE);
  }

  update(screener: MasterScreenerRecord): Rx.Observable<string> {
    this.cache.next(screener.serialize());
    return this.get();
  }
}


