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
        .do( _ => this.programCache.updatePrograms([new UserProgramRecord(data.user, this.client)]) )
        .subscribe(
          resp => res.end(JSON.stringify(resp)),
          error => KeyHandler.handleError(res, error)
        )
    }
  }

  update(): RouteHandler {
    return (req, res, next) => {
      console.log('update program route called')
      console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
      this.setupResponse(res);
      const data = req.body.data;
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
          },
          () => console.log('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n')
        )
    }
  }

  delete(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const guid = req.params.guid;
      console.log(guid)
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