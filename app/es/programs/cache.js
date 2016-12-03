const
Rx    = require('rxjs/Rx'),
utils = require('../utils');



const getAllPrograms = {
  match_all: {}
};

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
  // fails silently -- by ommitting malformed programs.
  addPrograms(programs) {
    if (!Array.isArray(programs)){
      console.log('programs is not an array');
      return;
    }
    programs.forEach( (program, index) => {
      if (program._id === undefined || program._source === undefined || program._source.doc === undefined || program._source.doc.value === undefined) {
        console.log(program);
        programs.splice(index, 1);
      }
    });
    this.addPrograms$.next(programs);
  }

  // will return hits (program objects) and misses (program ids)
  async getPrograms(programIDS){
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
           }, {hits: [], misses: []})
           .toPromise();
  }

  // gets all programs in cache
  async getAllPrograms() {
    return this.data$.take(1).toPromise();
  }
}

module.exports = {
  Cache
};
