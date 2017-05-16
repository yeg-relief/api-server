import * as Rx from 'rxjs/Rx'
import { RouteHandler } from '../../router';
import { ApplicationProgramRecord, UserProgramRecord } from '../../models';
import { NotificationEngine } from '../../notification-engine';
import { KeyHandler } from '../index';
import { ProgramCache } from '../../cache';
import * as uuid from 'node-uuid';

export class AdminProgram {
  constructor(
    private client: Elasticsearch.Client, 
    private notifications: NotificationEngine,
    private programCache: ProgramCache
  ){}

  getAll(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      ApplicationProgramRecord.getAll(this.client, this.notifications)
        // it's application in the client and queries in the server... *doh!*
        .flatMap(x => x)
        .map( program => {
          return {
            guid: program.guid,
            user: program.user,
            application: [...program.queries]
          }
        })
        .toArray()
        .subscribe(
          resp => res.end(JSON.stringify(resp)),
          error => KeyHandler.handleError(res, error)
        )
    }
  }

  create(): RouteHandler {
    return (req, res, next) => {
      console.log('create called!')

      this.setupResponse(res);
      const data = req.body.data;
      const record = new ApplicationProgramRecord({
        user: data.user,
        queries: data.application
      }, this.client, this.notifications);
      record.create()
        .do( _ => this.programCache.updatePrograms([new UserProgramRecord(data.user, this.client)]) )
        .subscribe(
          resp => res.end(JSON.stringify(resp)),
          error => KeyHandler.handleError(res, error)
        )
    }
  }

  update(): RouteHandler {
    return (req, res, next) => {
      console.log('update called')
      this.setupResponse(res);
      const data = req.body.data;
      for(const k in data) {
        console.log(k);
        console.log(data[k]);
      }
      const record = new ApplicationProgramRecord({
        user: data.user,
        queries: data.application
      }, this.client, this.notifications)
      Rx.Observable.fromPromise(record.save())
        .do( _ => this.programCache.updatePrograms([new UserProgramRecord(data.user, this.client)]) )
        .subscribe( 
          resp => res.end(JSON.stringify(resp)),
          error => {
            console.error(error)
            KeyHandler.handleError(res, error)
          }
        )
    }
  }

  delete(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const guid = req.params.guid;
      Rx.Observable.combineLatest(
        this.programCache.deleteProgram(guid),
        UserProgramRecord.delete(this.client, guid),
        this.notifications.deleteProgram(guid)
      )
      .subscribe(
        resp => res.end(JSON.stringify(resp)),
        error => {
          console.error(error)
          KeyHandler.handleError(res, error)
        }
      )
      

    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}