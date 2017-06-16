import { KeyHandler } from '../handlers';

exports.createOrUpdate = (notifications) => {
    return (req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const data = req.body.data;
      notifications.registerQueries([data.query], data.guid)
          .subscribe(
            resp => res.end(JSON.stringify(resp)),
            error => KeyHandler.handleError(res, error)
          )
    }
  }