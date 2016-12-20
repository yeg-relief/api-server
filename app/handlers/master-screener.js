const
    bodyParser = require('body-parser'),
    Router = require('router'),
    masterScreener = require('../es/master-screener/get'),
    upload = require('../es/master-screener/upload');

class MasterScreenerHandler {
    /*
      mutate the application level router to handle all routes in the 'keys' API.
    */
    static addRoutes(client, router) {
        if (client === undefined) {
            throw new Error('[BOOTSTRAP]: client argument undefined in KeyHandler');
        }
        const api = Router();
        api.use(bodyParser.json());

        // get the keys/properties for masterscreener
        api.get('/', getAllScreeners(client));
        // add keys/properties to masterscreener
        api.post('/', addScreener(client));
        // this is the router that handles all incoming requests
        router.use('/api/master_screener/', api);
    }
}

module.exports = {
    MasterScreenerHandler
};


function getAllScreeners(client) {
    return (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        masterScreener.getAll(client)
            .then(screeners => res.end(JSON.stringify({ response: screeners })))
            .catch(error => {
                res.statusCode = 500;
                res.end(JSON.stringify({ message: error.message }))
            });
    }
}

function addScreener(client) {
    return (req, res, next) => {
        res.setHeader('Content-Type', 'application/json');
        const screener = req.body.data;
        res.statusCode = 200;
        upload.uploadMasterScreenerQuestions(client, screener)
            .then(questions => res.end(JSON.stringify({ response: screener })))
            .catch(error => {
                console.error(error);
                res.statusCode = 500;
                res.end(JSON.stringify({
                    message: error.message
                }));
                next();
            });
    };
}