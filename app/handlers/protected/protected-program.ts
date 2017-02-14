import * as Rx from 'rxjs/Rx'
import { RouteHandler } from '../../router';
import { ApplicationProgramRecord } from '../../models';
import { NotificationEngine } from '../../notification-engine';
import { KeyHandler } from '../index';

export class AdminProgram {
  constructor(private client: Elasticsearch.Client, private notifications: NotificationEngine){}

  getAll(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      ApplicationProgramRecord.getAll(this.client, this.notifications)
        .do( _ => console.log('\n-------------------------\n'))
        .do(_ => console.log('sending this over network'))
        .do(_ => console.log(_))
        .do(_ => console.log('\n-------------------------\n'))
        .subscribe(
          resp => res.end(JSON.stringify(resp)),
          error => KeyHandler.handleError(res, error),
        )
    }
  }

  create(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const data = req.body.data;
      console.log(data);
      const record = new ApplicationProgramRecord({
        user: data.user,
        queries: data.application
      }, this.client, this.notifications);
      console.log('\n--------------------------------------\n');
      console.log(record.validate());
      record.create()
        .subscribe(
          resp => res.end(JSON.stringify(resp)),
          error => KeyHandler.handleError(res, error)
        )
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}