import { Client } from 'elasticsearch'
import { Router } from 'router';
import { MyRouter } from './router';
import * as http from 'http';
import * as finalhandler from 'finalhandler';


const config: Elasticsearch.ConfigOptions = { host: 'localhost:9200' }
const client: Elasticsearch.Client = new Client(config);
const myRouter = new MyRouter(client);
const server = http.createServer((req, res) => {
  myRouter.router(req, res, finalhandler(req, res))
})

server.listen(3000);
