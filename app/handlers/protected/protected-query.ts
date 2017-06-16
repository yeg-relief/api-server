import * as Rx from 'rxjs/Rx'
import { RouteHandler } from '../../router';
import { ApplicationProgramRecord, UserProgramRecord,  } from '../../models';
import { NotificationEngine } from '../../notification-engine';
import { KeyHandler } from '../index';
import { ProgramCache } from '../../cache';
import * as uuid from 'node-uuid';

export class AdminQuery {
  constructor(
    private client: Elasticsearch.Client, 
    private notifications: NotificationEngine,
  ){}

  createOrUpdate(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const data = req.body.data;
      this.notifications.createOrUpdate(data.query)
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