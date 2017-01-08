const
  Rx = require('rxjs/Rx'),
  utils = require('../utils');



const getAllPrograms = {
  match_all: {}
};

// TODO: consider applying OOP and super/sub classing
class Cache {
  constructor(client) {
    const MAX_SIZE = 100;
    this.addPrograms$ = new Rx.Subject();
    this.removeProgram$ = new Rx.Subject();
    this.updateProgram$ = new Rx.Subject();

    this.data$ = Rx.Observable.merge(
      this.addPrograms$,
      this.removeProgram$
    )
      .scan((accum, action) => {
        switch (action.type) {
          case 'ADD_PROGRAMS': {
            if (Object.keys(accum).length <= MAX_SIZE) {
              action.payload.forEach(program => {
                accum[program._id] = program._source.doc;
              })
            }
            return accum;
          }

          case 'REMOVE_PROGRAM': {
            console.log(action.type);
            const guid = action.payload;
            delete accum[guid];
            console.log(accum);
            return accum;
          }

          case 'UPDATE_PROGRAM': {
            const program = action.payload;
            accum[program._id] = program._source.doc;
            return accum;
          }

          default: {
            return accum;
          }
        }
      }, {})
      // share the observable for mutliple observers
      .multicast(new Rx.ReplaySubject(1)).refCount()
    // intiate the observable TODO: better way?
    this.data$.subscribe();
    // kind of gross
    this.initCache(client)
  }
  // runs a query to get ALL programs.. if somehow we actually ammass a large number of programs then this will be prohibitive
  initCache(client) {
    utils.search(client, 'programs', 'user_facing', getAllPrograms)
      .then((rawPrograms) => {
        if (rawPrograms.hits.total > 0) {
          console.log('=================')
          console.log('in initCache')
          console.log(rawPrograms.hits.hits)
          console.log('=================')
          this.addPrograms$.next({
            type: 'ADD_PROGRAMS',
            payload: rawPrograms.hits.hits
          });
        }
      });
  }


  addPrograms(programs) {
    if (!Array.isArray(programs)) {
      console.error('programs is not an array');
      return;
    }
    // mutate programs into proper format (ES style)
    const transformedPrograms = programs.map(program => {
      const newProgram = {};
      if (program.id !== undefined && program.program !== undefined) {
        newProgram._id = program.id;
        newProgram._source = {
          doc: {
            value: program.program
          }
        };
      }
      return newProgram;
    });


    transformedPrograms.forEach((program, index) => {
      if (program._id === undefined || program._source === undefined || program._source.doc === undefined || program._source.doc.value === undefined) {
        console.error(program);
        programs.splice(index, 1);
      }
    });
    this.addPrograms$.next({
      type: 'ADD_PROGRAMS',
      payload: transformedPrograms
    });
  }

  deleteProgram(guid) {
    if (guid === undefined || typeof guid !== 'string') {
      throw new Error('obviously invalid guid');
    }

    this.removeProgram$.next({
      type: 'REMOVE_PROGRAM',
      payload: guid
    });
    return Promise.resolve(true);
  }

  updateProgram(userProgram) {
    if (guid === undefined || typeof guid !== 'string') {
      throw new Error('obviously invalid guid');
    }
    console.log(userProgram);
    // strange format...
    const transformedProgram = transformProgram({ program: userProgram, id: userProgram.guid });
    console.log(transformedProgram);


    this.updateProgram$.next({
      type: 'UPDATE_PROGRAM',
      payload: transformedProgram
    })
    return Promise.resolve(true);
  }

  transformProgram(program) {
    const newProgram = {};
    if (program.id !== undefined && program.program !== undefined) {
      newProgram._id = program.id;
      newProgram._source = {
        doc: {
          value: program.program
        }
      };
    }
    return newProgram;
  }


  // will return hits (program objects) and misses (program ids)
  getProgramsBase(programIDS) {
    const data = this.data$.take(1);
    const ids = Rx.Observable.of(programIDS);

    return data.combineLatest(ids)
      .reduce((accum, [data, ids]) => {
        ids.forEach(id => {
          if (data[id] !== undefined) {
            accum.hits = [data[id], ...accum.hits];
          } else {
            accum.misses = [id, ...accum.misses];
          }
        });
        return accum;
      }, { hits: [], misses: [] })
      .timeoutWith(2000, Rx.Observable.of({ hits: [], misses: [] }))
  }

  // can get the above as promise or observable with either of the following 2 functions
  async getProgramsPromise(programIDS) {
    return this.getProgramsBase(programIDS).toPromise();
  }

  getProgramsObservable(programIDS) {
    return this.getProgramsBase(programIDS);
  }


  getAllProgramsBase() {
    return this.data$.take(1)
      .do(() => console.log('THIS IS the data$ stream'))
      .do(thing => console.log(thing))
      .do(() => console.log('===================='))
      .reduce((accum, cacheObj) => {
        Object.keys(cacheObj).forEach(key => accum.push(cacheObj[key]));
        return accum;
      }, [])
      .timeoutWith(2000, Rx.Observable.of([]))
  }
  // gets all programs in cache
  async getAllProgramsPromise() {
    return this.getAllProgramsBase().toPromise();
  }

  getAllProgramsObservable() {
    return this.getAllProgramsBase();
  }

}

module.exports = {
  Cache
};
