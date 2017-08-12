import { RouteHandler } from '../../router';
import { KeyRecord } from '../../models';
import * as Rx from 'rxjs/Rx';

export class KeyHandler {
    private client: Elasticsearch.Client;

    constructor(client: Elasticsearch.Client) {
        this.client = client;
    }

    getAllKeys(): RouteHandler {
        return (req, res, next) => {
            this.setupResponse(res);
            Rx.Observable.fromPromise(KeyRecord.getAll(this.client))
                .subscribe(
                    keys => res.end(JSON.stringify({ keys: keys })),
                    error => KeyHandler.handleError(res, error)
                )
        }
    }


    saveKey(): RouteHandler {
        return (req, res, next) => {
            this.setupResponse(res);
            if (req.body.key === undefined) {
                KeyHandler.handleError(res, new Error('key is undefined'));
            }
            const key = new KeyRecord(this.client, req.body.key);
            key.save()
                .then(update => res.end(JSON.stringify({ update: update })))
                .catch(error => KeyHandler.handleError(res, error));
        }
    }



    static handleError(res, error) {

        console.error(error);

        const sendError = () => {
            res.statusCode = 500;
            res.end(JSON.stringify({
                message: error.message
            }));
        };

        const sendEmpty = () => {
            res.end(JSON.stringify({
                message: error.message,
                keys: []
            }));
        };

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