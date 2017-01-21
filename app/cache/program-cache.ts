import { UserProgramRecord } from '../models';
import * as Rx from 'rxjs/Rx';

type Action = {
  type: ActionTypes;
  payload: (UserProgramRecord | UserProgramRecord[] | string);
}

type InternalCache = Map<string, string>

type ActionTypes = 'DELETE_PROGRAM' | 'ADD_PROGRAMS';

const TIMEOUT_VALUE = 10000;

export class ProgramCache {
  private cache: Rx.Observable<InternalCache>;
  private dispatch: Rx.Subject<Action>;

  constructor(cacheSeed: UserProgramRecord[]) {
    this.dispatch = new Rx.Subject<Action>();

    this.cache = this.dispatch.asObservable()
      .scan((internalCache: InternalCache, action: Action) => {

        switch (action.type) {

          case 'DELETE_PROGRAM': {
            const id = <string>action.payload;
            internalCache.delete(id);
            return internalCache;
          }

          case 'ADD_PROGRAMS': {
            const programs = <UserProgramRecord[]>action.payload;
            // if more than 100 programs cached do nothing 
            // TODO: alert that not all programs cached and cache as many as possible
            if (internalCache.keys.length + programs.length < 100) {
              programs.forEach(program => internalCache.set(program.getUserProgram().guid, program.serialize()))
            }
            return internalCache;
          }

          default: {
            return internalCache;
          }

        }
      })
      .multicast(new Rx.ReplaySubject(1)).refCount();
    
    // inject seed into cache
    this.updatePrograms(cacheSeed);
  }

  // this function does not alert for cache misses
  // TODO: alert cache misses -- partition into hits and misses
  getPrograms(ids: string[]): Rx.Observable<string[]> {
    return Rx.Observable.zip(
      this.cache,
      Rx.Observable.of(ids)
    )
      .map(([internalCache, ids]) => {
        return ids.reduce((serializedPrograms, id) => {
          if (internalCache.has(id)) {
            serializedPrograms.push(internalCache.get(id));
          }
          return serializedPrograms;
        }, [])
      })
      .timeout(TIMEOUT_VALUE);
  }

  deleteProgram(id: string): Rx.Observable<boolean> {
    this.dispatch.next({
      type: 'DELETE_PROGRAM',
      payload: id
    });

    return this.cache.take(1).map(internalCache => internalCache.has(id)).timeout(TIMEOUT_VALUE);
  }

  updatePrograms(programRecords: UserProgramRecord[]) {
    this.dispatch.next({
      type: 'ADD_PROGRAMS',
      payload: programRecords
    });
    return this.getPrograms(programRecords.map(record => record.getUserProgram().guid))
  }
}