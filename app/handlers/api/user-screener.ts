
import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';
import 'rxjs/add/operator/toPromise';

export class UserScreener {
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
          cachedScreener => res.end(JSON.stringify({ response: cachedScreener.questions})),
          error => KeyHandler.handleError(res, error),
          () => console.log(Date.now() - start)
        )
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}