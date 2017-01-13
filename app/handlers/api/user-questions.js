const
  bodyParser = require('body-parser'),
  Router = require('router'),
  getAll = require('../../es/master-screener/get').getAll;


class QuestionsHandler {
  static addRoutes(client, router) {
    if (client === undefined) {
      throw new Error('[BOOTSTRAP]: client undefined in QuestionsHandler');
    }
    const api = Router();
    api.use(bodyParser.json());
    api.get('/latest/', getLatestVersion(client));
    // this is the router that handles all incoming requests for the server
    router.use('/api/questions/', api);
  }
}

module.exports = {
  QuestionsHandler
};

function getLatestVersion(client) {
  return (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    getAll(client)
      .then(questions => {
        console.log(questions);
        // we dont actually query ES right now... just grab all masterscreeners in index
        // obviously this can be -- and will -- be improved
        if (Array.isArray(questions) && questions.length > 1) {
          console.log('mulitple questions');
          // sort for latest version
          const sorted = questions.sort((a, b) => a.version - b.version);
          const last = sorted.length - 1;
          res.end(JSON.stringify({ response: sorted[last].questions }));
        } else if (Array.isArray(questions) && questions.length === 1) {
          res.end(JSON.stringify({ response: questions[0].questions }));
        } else {
          res.end(JSON.stringify({ response: {} }));
        }
      })
      .catch(error => {
        console.error(error);
        res.statusCode = 500;
        res.end(JSON.stringify({
          message: error.message
        }));
        // needed?
        next();
      });
  };
}
