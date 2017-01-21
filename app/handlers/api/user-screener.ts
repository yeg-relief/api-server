import { Client } from 'elasticsearch';
import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';
import 'rxjs/add/operator/toPromise';

export class UserScreener {
  client: Elasticsearch.Client;
  cache: ScreenerCache;

  constructor(client: Elasticsearch.Client, cache: ScreenerCache){
    this.client = client;
    this.cache = cache;
  }

  getScreener(): RouteHandler {
    return (req, res, next) => {
      console.log('GET SCREENER CALLED')
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