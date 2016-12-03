const
Rx    = require('rxjs/Rx'),
utils = require('../utils');



const getAllPrograms = {
  match_all: {}
};

class Cache{
  constructor(client) {
    this.client = client;
    this.addPrograms$ = new Rx.Subject();

    this.data$ = Rx.Observable.merge(
      this.addPrograms$,
      this.initCache()
    )
    .flatMap(x => x)
    .scan( (accum, program) => {
      if(Object.keys(accum).length <= 100) {
        accum[program._id] = program._source.doc;
      }
      return accum;
    }, {})
    .multicast(new Rx.ReplaySubject(1)).refCount();

    this.data$.subscribe();
  }

  initCache(){
    const initLoad$ = Rx.Observable.fromPromise(utils.search(this.client, 'programs', 'user_facing', getAllPrograms));

    return initLoad$
           .filter(res => res.hits.total >  0)
           .pluck('hits', 'hits');
  }
  // fails silently
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

  async getPrograms(programIDS){
    const data = this.data$.take(1);
    const ids = Rx.Observable.of(programIDS);

    return data.combineLatest(ids)
           .reduce( (accum, [data, ids]) => {
             ids.forEach(id => {
               if(data[id] !== undefined) {
                 accum = [data[id], ...accum];
               }
             });
             return accum;
           }, [])
           .toPromise();
  }

  async getAllPrograms() {
    return this.data$.take(1).toPromise();
  }
}

module.exports = {
  Cache
};
