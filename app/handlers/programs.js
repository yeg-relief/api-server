const
  bodyParser = require('body-parser'),
  Router = require('router'),
  percolator = require('../es/percolator/init-percolator'),
  programs = require('../es/programs/user-facing-upload'),
  applyMetaData = require('../utils/programs').applyMetaData,
  Rx = require('rxjs/Rx'),
  utils = require('../es/utils'),
  progUtils = require('../utils/programs');

class ProgramHandler {
  static addRoutes(client, cache, router) {
    if (client === undefined || cache === undefined) {
      throw new Error('[BOOTSTRAP]: client or cache undefined in ProgramHandler');
    }
    const api = Router();
    api.use(bodyParser.json());

    api.post('/', uploadNewProgram(client, cache));
    // user facing programs
    api.get('/', getAllPrograms(client, cache));
    api.delete(':guid', deleteProgram(client, cache));
    api.get('/application', getAllProgramsApplicationIncluded(client, cache));

    // this is the router that handles all incoming requests for the server
    router.use('/api/programs/', api);
  }
}

module.exports = {
  ProgramHandler
};

function uploadNewProgram(client, cache) {
  return (req, res, next) => {
    res.statusCode = 200;
    const data = req.body.data;
    console.log(data);
    res.setHeader('Content-Type', 'application/json');
    if (data === undefined || data.application === undefined || data.user === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'program is not well formed'
      }));
      return next();
    }
    if (data.guid !== 'new') {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'POST messages to /programs/ are for programs with a "new" guid only'
      }));
      return next();
    }

    // mutate the uploaded program and apply timestamp and GUID
    let programWithMetaData;
    try {
      programWithMetaData = applyMetaData(data);
    } catch (error) {
      console.error(error.message);
      res.statusCode = 500;
      res.end(JSON.stringify({
        message: error.message
      }));
      return next();
    }
    console.log('===========================')
    console.log('programWithMetaData')
    console.log(programWithMetaData)
    console.log('===========================')

    const application = programWithMetaData.application;
    const program = programWithMetaData.user;

    // TODO: investigate wether or not this properly adds queries to percolator -- seems doubtful
    percolator.addQueries(client, application)
      .then(() => programs.handleProgramUpload(client, program, programWithMetaData.guid))
      .then(() => res.end(JSON.stringify({ created: true })))
      .then(() => cache.addPrograms([{ program: program, id: programWithMetaData.guid }]))
      .then(() => next())
      .catch(error => {
        res.statusCode = 500;
        console.error(error.message);
        res.end(JSON.stringify({
          message: error.message
        }));
        return next();
      });
  };
}

function getAllPrograms(client, cache) {
  return (_, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    cache.getAllProgramsBase()
      .do(() => res.statusCode = 200)
      //.reduce( (accum, program) => [program.value, ...accum], [])
      .subscribe({
        next: programs => res.end(JSON.stringify({ programs: programs })),
        error: err => {
          res.statusCode = 500;
          console.error(err.message);
          res.send(JSON.stringify({ message: err.message }));
        },
        complete: () => next()
      });
  };
}

function deleteProgram(client, cache) {
  return (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;

    utils.deleteDoc(client, 'programs', 'user_facing', req.body)
      .then((_) => cache.deleteProgram(req.body))
      .then(valid => res.end(JSON.stringify({ removed: valid })))
      .catch(error => {
        console.error(error.message);
        res.statusCode = 500;
        res.send(JSON.stringify({ message: error.message }));
      })
  }
}

function getAllProgramsApplicationIncluded(client, cache) {
  //const userFacingPrograms = utils.search(client, 'programs', 'user_facing', getAllPrograms);
  const filterHits = (searchResult) => {
    console.log(searchResult);
    if (searchResult.hits.total > 0) {
      const reducedHits = searchResult.hits.hits.reduce((hits, hit) => {
        let guidQueries;
        if (hits.has(hit._source.meta.program_guid)) {
          guidQueries = [...hits.get(hit._source.meta.program_guid)];
        } else {
          guidQueries = [];
        }
        guidQueries.push(hit._source.query);
        hits.set(hit._source.meta.program_guid, guidQueries);
        return hits;
      }, new Map());
      return Promise.resolve(reducedHits);
    } else {
      return Promise.resolve(new Map());
    }
  }

  const strMapToObj = (strMap) => {
    let obj = Object.create(null);
    for (let [k, v] of strMap) {
      // We don’t escape the key '__proto__'
      // which can cause problems on older engines
      obj[k] = v;
    }
    return obj;
  }


  return (_, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    utils.getAllPercolators(client)
      .then(data => {
        console.log('=======================')
        console.log('getAllPercolators')
        console.log(data)
        console.log('=======================')
        return filterHits(data)
      })
      .then( (applicationProgramMap) => {
        console.log('=======================')
        console.log('applicationProgramMap')
        console.log(applicationProgramMap)
        console.log('=======================')
        // can be simplified?
        return Promise.all([Promise.resolve(applicationProgramMap), cache.getAllProgramsPromise()]);
      })
      .then(data => {
        console.log('============================')
        console.log('final')
        console.log('data[0]')
        console.log(data[0])
        console.log('\n\ndata[1]')
        console.log(data[1])
        console.log('============================')
        const applicationFacing = data[0]; // this is a Map
        const userFacing = data[1]; // this is an array of objects
        /*
          export interface ApplicationFacingProgram {
            guid: string;
            application: ProgramQuery[];
            user: UserFacingProgram;
          }
        */
        const joined = userFacing.reduce( (accum, uProgram) => {
          const joinedProgram = Object.create(null);
          if (applicationFacing.has(uProgram.value.guid)) {
            joinedProgram['guid'] = uProgram.value.guid;
            joinedProgram['user'] = uProgram.value;
            console.log(applicationFacing.get(uProgram.value.guid));
            console.log(progUtils.applicationToConditions(applicationFacing.get(uProgram.value.guid)));
            joinedProgram['application'] = progUtils.applicationToConditions(applicationFacing.get(uProgram.value.guid));
            return [joinedProgram, ...accum];
          }
          return accum;
        }, []);
        const payload = JSON.stringify({ data: joined });
        res.end(payload)
      })
      .catch(error => {
        console.error(error.message);
        res.statusCode = 500;
        res.send(JSON.stringify({ message: error.message }));
      })

  }
}