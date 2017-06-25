import { RouteHandler } from '../../router';
import { Client } from 'elasticsearch';
import { KeyRecord } from '../../models';
import { Key } from '../../shared';
import * as Rx from 'rxjs/Rx';

export class ProgramDescriptionHandler {
  private client: Elasticsearch.Client;

  constructor(client: Elasticsearch.Client) {
    this.client = client;
  }

  private _createProgram(program){
    const p = JSON.parse(program);
    p.created = Date.now();
    const params = {
      index: 'programs',
      type: 'user_facing',
      id: p.guid,
      body: p
    }
    return this.client.create(params)
    .then(response => {
      console.log(response);
      if (response.result === 'updated' || response.created) {
        return Promise.resolve(response)
      }
      return Promise.reject(`program with ${p.guid}: [failed create]`)
    })
    .catch(e => {
      console.log('WHAT I"M HERER OMOEMOEMFOE');
      console.log(e)
    })
  }

  private _updateProgram(program){
    const p = JSON.parse(program);
    p.created = Date.now();
    const params: Elasticsearch.IndexDocumentParams<any> = {
      index: 'programs',
      type: 'user_facing',
      id: p.guid,
      body: p
    }
    return this.client.index(params)
    .then(response => {
      console.log(response);
      if (response.result === 'updated' || response.created) {
        return Promise.resolve(response)
      }
      return Promise.reject(`program with ${p.guid}: [failed create]`)
    })
    .catch(e => {
      console.log('WHAT I"M HERER OMOEMOEMFOE');
      console.log(e)
    })
  }


  create() {
    const bleh = async (req, res, next) => {
      this.setupResponse(res);
      const program  = req.body.data;
      try {
        const created = await this._createProgram(program)
        console.log(created);
        res.end(JSON.stringify(created));

      } catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.end(JSON.stringify( e ));

      } 
    }

    return (req, res, next) => {
      bleh(req, res, next).then();
    }
  }

  update() {
    const bleh = async (req, res, next) => {
      this.setupResponse(res);
      const program  = req.body.data;
      try {
        const created = await this._updateProgram(program)
        console.log(created);
        res.end(JSON.stringify(created));

      } catch (e) {
        console.error(e);
        res.statusCode = 500;
        res.end(JSON.stringify( e ));

      } 
    }

    return (req, res, next) => {
      bleh(req, res, next).then();
    }
  }



  static handleError(res, error) {

    const sendError = () => {
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: error.message
      }));
    }

    const sendEmpty = () => {
      res.end(JSON.stringify({
        message: error.message,
        keys: []
      }));
    }

    if (error.message === 'Cannot convert undefined or null to object') {
      sendEmpty();
    } else {
      sendError();
    }

  }



  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }



}