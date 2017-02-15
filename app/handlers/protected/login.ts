import { RouteHandler } from '../../router';

export class LoginHandler {

  static login(): RouteHandler {
    return (req, res, next) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ login: true }))
    }
  }
}