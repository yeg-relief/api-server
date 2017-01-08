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
    api.delete('/:guid', deleteProgram(client, cache));
    api.get('/application', getAllProgramsApplicationIncluded(client, cache));

    api.put('/', updateProgram(client, cache));

    // this is the router that handles all incoming requests for the server
    router.use('/api/programs/', api);
  }
}

module.exports = {
  ProgramHandler
};

function updateProgram(client, cache) {
  return (req, res, next) => {
    res.statusCode = 200;
    const program = req.body.data;
    res.setHeader('Content-Type', 'application/json');
    if (program === undefined || program.application === undefined || program.user === undefined) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'program is not well formed'
      }));
      return next();
    }
    if (data.guid === 'new') {
      res.statusCode = 400;
      res.end(JSON.stringify({
        message: 'PUT messages to /programs/ are for programs with an already allocated guid'
      }));
      return next();
    }
    // update the creation/uploaded date
    program.user.created = (new Date).getTime();

    const appliction = program.application;
    const user = program.user;
    percolator.updateQueries(client, application, program.guid)
      .then(() => cache.updateProgram(user))
      .then(() => res.end(JSON.stringify({ created: true })))
      .then(() => next())
      .catch(error => {
        res.statusCode = 500;
        console.error(error.message);
        res.end(JSON.stringify({
          message: error.message
        }));
        return next();
      })
  }
}


function uploadNewProgram(client, cache) {
  return (req, res, next) => {
    res.statusCode = 200;
    const data = req.body.data;
    console.log(data);
    res.setHeader('Content-Type', 'application/json');
    if (data === undefined || data.application === undefined || data.user === undefined || data.application.length === 0) {
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
    percolator.addQueries(client, application, programWithMetaData.guid)
      .then(() => programs.handleProgramUpload(client, program, programWithMetaData.guid))
      .then(() => cache.addPrograms([{ program: program, id: programWithMetaData.guid }]))
      .then(() => res.end(JSON.stringify({ created: true })))
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
  const filterPercolators = (searchResults, guid) => {
    if (searchResults.hits.total > 0) {
      const filtered = searchResults.hits.hits.filter(hit => hit._source.meta.program_guid === guid)
      const ids = filtered.reduce( (accum, hit) => {
        return [hit._id, ...accum];
      }, [])
      return Promise.resolve(ids);
    }
    return Promise.resolve([]);
  }


  return (req, res, next) => {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    const guid = req.params.guid;
    console.log('=========================================');
    console.log(`delete program called with guid: ${guid}`);
    console.log('==========================================');

    utils.deleteDoc(client, 'programs', 'user_facing', guid)
      .then((_) => cache.deleteProgram(guid))
      .then(() => utils.getAllPercolators(client))
      .then(percolators => filterPercolators(percolators, guid))
      .then(ids => percolator.deleteQueries(client, ids))
      .then(valid => res.end(JSON.stringify({ removed: valid })))
      .catch(error => {
        console.error(error.message);
        res.statusCode = 500;
        res.end(JSON.stringify({ message: error.message }));
      })
  }
}

function getAllProgramsApplicationIncluded(client, cache) {
  //const userFacingPrograms = utils.search(client, 'programs', 'user_facing', getAllPrograms);
  const filterHits = (searchResult) => {
    if (searchResult.hits.total > 0) {
      const reducedHits = searchResult.hits.hits.reduce((hits, hit) => {
        console.log(hit);
        let guidQueries;
        if (hits.has(hit._source.meta.program_guid)) {
          guidQueries = [...hits.get(hit._source.meta.program_guid)];
        } else {
          guidQueries = [];
        }
        guidQueries.push({ query: hit._source.query, id: hit._id });
        hits.set(hit._source.meta.program_guid, guidQueries);
        return hits;
      }, new Map());
      return Promise.resolve(reducedHits);
    } 
    return Promise.resolve(new Map());
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
      .then(data => filterHits(data))
      .then((applicationProgramMap) => Promise.all([Promise.resolve(applicationProgramMap), cache.getAllProgramsPromise()]))
      .then(data => {
        const applicationFacing = data[0]; // this is a Map
        const userFacing = data[1]; // this is an array of objects
        /*
          export interface ApplicationFacingProgram {
            guid: string;
            application: ProgramQuery[];
            user: UserFacingProgram;
          }
        */
        const joined = userFacing.reduce((accum, uProgram) => {
          const joinedProgram = Object.create(null);
          if (applicationFacing.has(uProgram.value.guid)) {
            joinedProgram['guid'] = uProgram.value.guid;
            joinedProgram['user'] = uProgram.value;
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
        res.end(JSON.stringify({ message: error.message }));
      })
  }
}