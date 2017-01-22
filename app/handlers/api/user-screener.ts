
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
      this.setupResponse(res);
      this.cache.get().toPromise()
        .then(serializedScreener => res.end(JSON.stringify({ response: serializedScreener})))
        .catch(error => KeyHandler.handleError(res, error));
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}