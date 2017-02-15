import * as Rx from 'rxjs/Rx'
import { RouteHandler } from '../../router';
import { ApplicationProgramRecord, UserProgramRecord } from '../../models';
import { NotificationEngine } from '../../notification-engine';
import { KeyHandler } from '../index';
import * as uuid from 'node-uuid';

export class AdminProgram {
  constructor(private client: Elasticsearch.Client, private notifications: NotificationEngine){}

  getAll(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const userPrograms = Rx.Observable.fromPromise(UserProgramRecord.getAll(this.client));

      Rx.Observable.zip(
        userPrograms,
        ApplicationProgramRecord.getAll(this.client, this.notifications)
      )
      .subscribe(
        resp => res.end(JSON.stringify({ programs: resp[0], queries: resp[1]})),
        error => KeyHandler.handleError(res, error)
      )
    }
  }

  create(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const data = req.body.data;
      const record = new ApplicationProgramRecord({
        user: data.user,
        queries: data.application
      }, this.client, this.notifications);
      record.create()
        .subscribe(
          resp => res.end(JSON.stringify(resp)),
          error => KeyHandler.handleError(res, error)
        )
    }
  }

  update(): RouteHandler {
    return (req, res, next) => {
      console.log('update program route called')
      this.setupResponse(res);
      const data = req.body.data;
      const record = new ApplicationProgramRecord({
        user: data.user,
        queries: data.application
      }, this.client, this.notifications)
      const obs = Rx.Observable.fromPromise(record.save())
      obs
        .do(thing => console.log(thing))
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