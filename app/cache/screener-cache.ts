import { ScreenerRecord } from '../models';
import { Screener } from '../shared';
import * as Rx from 'rxjs/Rx';

const TIMEOUT_VALUE = 100;

export class ScreenerCache {
  private cache: Rx.ReplaySubject<Screener>;

  constructor(cacheSeed: ScreenerRecord) {
    this.cache = new Rx.ReplaySubject<Screener>(1);
    this.cache.next(cacheSeed.getScreener());
  }

  get(): Rx.Observable<Screener> {
    return this.cache
      .asObservable().take(1)
      .timeout(TIMEOUT_VALUE);
  }

  update(screener: ScreenerRecord): Rx.Observable<Screener> {
    this.cache.next(screener.getScreener());
    return this.get();
  }
}


