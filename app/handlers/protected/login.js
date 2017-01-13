const Router = require('router');

class LoginHandler {
    /*
      mutate the application level router to handle all routes in the 'keys' API.
    */
    static addRoutes(router) {
        if (router === undefined) {
            throw new Error('[BOOTSTRAP]: router argument undefined in LoginHandler');
        }
        const api = Router();

        // the reverse proxy will handle the basic auth, i.e. if client doesn't get a 401 response
        // from the reverse proxy, then the login was valid
        api.get('/', login());
        // this is the router that handles all incoming requests
        router.use('/protected/login/', api);
    }
}

module.exports = {
    LoginHandler
};

function login() {
    return (req, res, next) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({login: true}))
    }
}