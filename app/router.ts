const Router = require('router');
import * as bodyParser from 'body-parser';
import { Client } from 'elasticsearch';
import * as Handlers from './handlers';
import * as Cache from './cache';


export class MyRouter {
  public router;
  private screenerCache: Cache.ScreenerCache;
  private client: Elasticsearch.Client

  private keyHandler: Handlers.KeyHandler;
  private userScreenerHandler: Handlers.UserScreener;

  private routes: RouteDeclaration[];




  constructor(
    client: Elasticsearch.Client,
    screenerCache: Cache.ScreenerCache
  ) {
    this.client = client;
    this.screenerCache = screenerCache;
    this.router = Router();
    this.router.use(bodyParser.json())

    this.keyHandler = new Handlers.KeyHandler(this.client);
    this.userScreenerHandler = new Handlers.UserScreener(this.client, this.screenerCache);

    this.routes = this.parseRouteDeclarations();
    this.buildRoutes();
  }

  private parseRouteDeclarations(): RouteDeclaration[] {
    return [

      /************************* MISC *************************/

      // test if server alive
      { Prefix: '', Path: '/ping', Verb: GET, Handler: pingHandler },

      /************************ PROTECTED  ********************/

      // login => this app is designed so that it is behind a reverse proxy => configure proxy for basic auth etc.
      { Prefix: PROTECTED, Path: '/login/', Verb: GET, Handler: Handlers.LoginHandler.login() },

      // keys 
      { Prefix: PROTECTED, Path: '/key/', Verb: GET, Handler: this.keyHandler.getAllKeys() },
      { Prefix: PROTECTED, Path: '/key/', Verb: POST, Handler: this.keyHandler.saveKey() },

      // screener => this is for acessing the notificaion engine and returning programs



      /*************************** API ************************/

      // screener => this is for getting the screener questions
      { Prefix: API, Path: '/screener/', Verb: GET, Handler: this.userScreenerHandler.getScreener() }

    ]
  }

  private buildRoutes() {

    const applyRoute = (route: RouteDeclaration) => {
      const myPath = route.Prefix + route.Path;
      switch (route.Verb) {
        case GET: {
          this.router.get(myPath, route.Handler)
          break;
        }

        case PUT: {
          this.router.put(myPath, route.Handler)
          break;
        }

        case POST: {
          this.router.post(myPath, route.Handler)
          break;
        }

        case DELETE: {
          this.router.delete(myPath, route.Handler)
          break;
        }

        default: {
          throw new Error(`invalid route definition: ${route}`)
        }
      }
    }

    for (let i = 0; i < this.routes.length; i++) {
      applyRoute(this.routes[i]);
    }

  }
}

export interface RouteHandler {
  (req, res, next): void;
}
type RouteDeclaration = {
  Prefix: '/api' | '/protected' | '',
  Path: (string | RegExp),
  Verb: 'GET' | 'POST' | 'PUT' | 'DELETE',
  Handler: (RouteHandler)
};

const GET = 'GET';
const POST = 'POST';
const PUT = 'PUT';
const DELETE = 'DELETE';

const API = '/api';
const PROTECTED = '/protected';


const pingHandler: RouteHandler = (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ response: 'operational' }));
}
