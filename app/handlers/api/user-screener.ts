import { ScreenerCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';

export class UserScreener {
  constructor(private cache: ScreenerCache){
    this.cache = cache;
  }

  getScreener(): RouteHandler {
    return (req, res) => {
      this.setupResponse(res);
      this.cache.get()
        .take(1)
        .subscribe(
          cachedScreener => res.end(JSON.stringify({ 
            questions: cachedScreener.questions, 
            conditionalQuestions: cachedScreener.conditionalQuestions
          })),
          error => KeyHandler.handleError(res, error)
        )
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}