import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';
import 'rxjs/add/operator/toPromise';

export class AdminScreener {
  constructor(private cache: ScreenerCache){
    this.cache = cache;
  }

  getScreener(): RouteHandler {
    return (req, res, next) => {
      const start = Date.now();
      this.setupResponse(res);
      this.cache.get()
        .take(1)
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
      this.cache.get()
        .take(1)
        .do(thing => console.log(thing))
        .subscribe(
          cachedScreener => res.end(JSON.stringify({ response: cachedScreener })),
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