import { Router } from 'router';
import { bodyParser } from 'body-parser';
import { Client } from 'elasticsearch';
import * as Handlers from './handlers';
import * as Cache from './cache';


export class MyRouter {
  /*
  private config: Elasticsearch.ConfigOptions = { host: 'localhost:9200' }
  private client: Elasticsearch.Client = new Client(this.config);
  */
  private router;
  private client: Elasticsearch.Client
  private keyHandler: Handlers.KeyHandler;
  private routes: RouteDeclaration[];

  constructor(
    client: Elasticsearch.Client, 
    programChache: Cache.ProgramCache, 
    screenerCache: Cache.ScreenerCache) 
  {
    this.client = client;
    this.router = Router();
    this.router.use(bodyParser.json())

    this.keyHandler = new Handlers.KeyHandler(this.client);

    this.routes = this.buildRoutes();
    this.applyRoutes();
  }

  private buildRoutes(): RouteDeclaration[] {
    return [

      /************************* MISC *************************/

      // test if server alive
      { Prefix: '', Path: '/ping', Verb: GET, Handler: pingHandler },

      // unknown route handler
      { Prefix: '', Path: /^(.*)$/, Verb: GET, Handler: incorrectCommandHandler },
      { Prefix: '', Path: /^(.*)$/, Verb: PUT, Handler: incorrectCommandHandler },
      { Prefix: '', Path: /^(.*)$/, Verb: POST, Handler: incorrectCommandHandler },
      { Prefix: '', Path: /^(.*)$/, Verb: DELETE, Handler: incorrectCommandHandler },


      /************************ PROTECTED  ********************/

      // keys 
      { Prefix: PROTECTED, Path: '/key/', Verb: GET, Handler: this.keyHandler.getAllKeys() },
      { Prefix: PROTECTED, Path: '/key/', Verb: POST, Handler: this.keyHandler.saveKey() }


      /*************************** API ************************/
    ]
  }

  private applyRoutes() {

    const applyRoute = (route: RouteDeclaration) => {
      const myPath = route.Prefix + route.Path;
      switch(route.Verb) {
        case GET: {
          this.router.get( myPath, route.Handler )
          break;
        }

        case PUT: {
          this.router.put( myPath, route.Handler )
          break; 
        }

        case POST: {
          this.router.post( myPath, route.Handler )
          break;
        }

        case DELETE: {
          this.router.delete( myPath, route.Handler )
          break;
        }

        default: {
          throw new Error(`invalid route definition: ${route}`)
        }
      }
    }

    for(let i = 0; i < this.routes.length; i++) {
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

const incorrectCommandHandler: RouteHandler = (req, res, next) => {
  res.statusCode = 400;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Unknown Command' }));
}






function applyRoutes(router: Router) {

}
