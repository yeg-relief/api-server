import { Client } from 'elasticsearch';
import { NotificationEngine } from '../../notification-engine';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';

export class Notification {
  constructor(  private notifications: NotificationEngine ){
    this.notifications = notifications;
  }

  notify(): RouteHandler {
    return (req, res, next) => {
      this.setupResponse(res);
      const data = req.body.data
      this.notifications.percolate(data)
        .take(1)
        .subscribe( 
          notifications => res.end(JSON.stringify({ response: notifications, msg: 'in a bottle' })),
          error => KeyHandler.handleError(res, error) ,
          () => console.log('notification complete') 
        )
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}