const
Rx    = require('rxjs/Rx'),
utils = require('../utils');



const getAllPrograms = {
  match_all: {}
};

// TODO: consider applying OOP and super/sub classing
class Cache{
  constructor(client) {
    const MAX_SIZE = 100;
    this.addPrograms$ = new Rx.Subject();

    this.data$ = Rx.Observable.merge(
      this.addPrograms$,
      this.initCache(client)
    )
    // flatten arrays
    .flatMap(x => x)
    .scan( (accum, program) => {
      if(Object.keys(accum).length <= MAX_SIZE) {
        accum[program._id] = program._source.doc;
      }
      return accum;
    }, {})
    // share the observable for mutliple observers
    .multicast(new Rx.ReplaySubject(1)).refCount();
    // intiate the observable TODO: better way?
    this.data$.subscribe();
  }
  // runs a query to get ALL programs.. if somehow we actually ammass a large number of programs then this will be prohibitive
  initCache(client){
    const initLoad$ = Rx.Observable.fromPromise(utils.search(client, 'programs', 'user_facing', getAllPrograms));

    return initLoad$
           .filter(res => res.hits.total >  0)
           .pluck('hits', 'hits');
  }


  addPrograms(programs) {
    if (!Array.isArray(programs)){
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


    transformedPrograms.forEach( (program, index) => {
      if (program._id === undefined || program._source === undefined || program._source.doc === undefined || program._source.doc.value === undefined) {
        console.error(program);
        programs.splice(index, 1);
      }
    });
    this.addPrograms$.next(transformedPrograms);
  }

  // will return hits (program objects) and misses (program ids)
  getProgramsBase(programIDS){
    const data = this.data$.take(1);
    const ids = Rx.Observable.of(programIDS);

    return data.combineLatest(ids)
           .reduce( (accum, [data, ids]) => {
             ids.forEach(id => {
               if(data[id] !== undefined) {
                 accum.hits = [data[id], ...accum.hits];
               } else {
                 accum.misses = [id, ...accum.misses];
               }
             });
             return accum;
           }, {hits: [], misses: []});
  }

  // can get the above as promise or observable with either of the following 2 functions
  async getProgramsPromise(programIDS){
    return this.getProgramsBase(programIDS).toPromise();
  }

  getProgramsObservable(programIDS) {
    return this.getProgramsBase(programIDS);
  }


  getAllProgramsBase() {
    return this.data$.take(1);
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
