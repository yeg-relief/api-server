import * as Rx from 'rxjs/Rx';
import * as QueryConverter from './index';
import { UserProgram, ApplicationProgram, ProgramQuery, Condition, NumberCondition, BooleanCondition } from '../shared';
import { ScreenerRecord, ApplicationProgramRecord } from '../models';
import { ProgramCache } from '../cache';

const percolateParams = (data): Elasticsearch.SearchParams => {
  return {
    index: 'master_screener',
    body: {
      query: {
        percolate: {
          field: 'query',
          document_type: 'queries',
          document:   data 
        }
      },
      _source: {
        includes: 'meta.*'
      }
    }
  }
}

export class NotificationEngine {
  private programCache: ProgramCache;
  private client: Elasticsearch.Client;

  constructor(client: Elasticsearch.Client, cache: ProgramCache) {
    this.programCache = cache;
    this.client = client;
  }


  getQueries(programId: string) {
    const getAllPromise = this.client.search<ProgramQuery>({
      index: 'master_screener',
      body: {
        query: {
          match_all: {}
        }
      }
    })

    return Rx.Observable.fromPromise<Elasticsearch.SearchResponse<ProgramQuery>>(getAllPromise)
      .flatMap(res => Rx.Observable.from(res.hits.hits))
      .filter( (res: any) => res._source.meta.program_guid === programId )
      .reduce( (sources, hit) => [hit._source, ...sources], [] )
      .reduce( (queries: ProgramQuery[], source) => [QueryConverter.EsToQuery(source), ...queries], [])
      .flatMap(x => x[0])
  }

  percolate(data: any): Rx.Observable<string[]> {
    const promise = this.client.search<string[]>(percolateParams(data))
    const observable = Rx.Observable.fromPromise((promise));


    return observable
      .flatMap(res => Rx.Observable.of(res.hits.hits))
      .flatMap( x => x)
      .reduce((accum, hit: any) => [hit._source.meta.program_guid, ...accum], [])
      .reduce( (guids: any[], ids: string[]) => {
        for(const id of ids) {
          if (guids.find(guid => guid === id) === undefined){
            guids.push(id);
          }
        }
        return guids;
      }, new Array<string>())
      .flatMap((guids: string[]) => this.programCache.getPrograms(guids))
  }

  registerQueries(programQueries: ProgramQuery[], guid: string) {
    if (programQueries.length === 0 ) return Rx.Observable.of([]);


    const esSearchQueries = Rx.Observable.from(programQueries.map(query => QueryConverter.queryToES(query)));
    const queries = Rx.Observable.from(programQueries);


    return Rx.Observable.zip(
      esSearchQueries,
      queries
    )
      .flatMap(([searchQuery, appQuery]) => {
        const query = (<any>Object).assign({}, searchQuery)
        const meta = {
          program_guid: appQuery.guid,
          id: appQuery.id
        }

        return Rx.Observable.from(this.client.create({
          index: 'master_screener',
          type: 'queries',
          id: appQuery.id,
          body: {
            query: query,
            meta: meta
          }
        }))
      })
      .reduce((allQueries, query) => [query, ...allQueries], [])
      .flatMap(queryArry => Rx.Observable.fromPromise(Promise.all(queryArry)))
  }


  updateQueries(programQueries: ProgramQuery[], guid: string) {
    if (programQueries.length === 0 ) return Rx.Observable.of([]);

    const esSearchQueries = Rx.Observable.from(programQueries.map(query => QueryConverter.queryToES(query)));
    const queries = Rx.Observable.from(programQueries);
    return Rx.Observable.zip(
      esSearchQueries,
      queries
    )
    .flatMap(([searchQuery, appQuery]) => {
        console.log('\n``````````\n')
        console.log(searchQuery)
        console.log(appQuery)
        const query = (<any>Object).assign({}, searchQuery)
        const meta = {
          program_guid: appQuery.guid,
          id: appQuery.id
        }

        console.log(query)
        console.log('\n``````````````\n')

        return Rx.Observable.from(this.client.index({
          index: 'master_screener',
          type: 'queries',
          id: appQuery.id,
          body: {
            query: query,
            meta: meta
          }
        }))
      })
      .reduce((allQueries, query) => [query, ...allQueries], [])
      .flatMap(queryArry => Rx.Observable.fromPromise(Promise.all(queryArry)))
  }

  updateProgram(programQueries, guid) {
    

    return Rx.Observable.zip(
      this.getQueries(guid).toArray(),
      Rx.Observable.of(programQueries)
    )
    .do( _ => console.log('UPDATE PROGRAM OBSERVABLE EXECUTED'))
    /*
    .do( _ => console.log('---------------------'))
    .do( ([registerQueries, programQueries]) => {
      console.log('\n REGISTERED QUERIES \n')
      for(const query of registerQueries) {
        for(const cond of (<any>query).conditions) {
          logObject(cond);
        }
      }

      console.log('\n PROGRAM QUERIES \n')
      for(const query of programQueries) {
        for(const cond of (<any>query).conditions) {
          logObject(cond);
        }
      }
    })
    
    */
    .do( _ => console.log('---------------------'))
    .reduce( (accum, [registeredQueries, programQueries]) => {
      const present = registeredQueries.filter( (query: any) => programQueries.find( (pq: any) => pq.id === query.id) !== undefined );
      const deleted = registeredQueries.filter( (query: any) => programQueries.find( (pq: any) => pq.id === query.id) === undefined ); 
      const missing = programQueries.filter( (query: any) => registeredQueries.find( (rq: any) => rq.id === query.id) === undefined );
 
      console.log('\nPRESENT\n')
      present.forEach(q => logObject((<any>q).conditions))

      console.log('\nDELETED\n')
      deleted.forEach(q => logObject((<any>q).conditions))

      console.log('\nMISSING\n')
      missing.forEach(q => logObject((<any>q).conditions))

      return [
        present.map( (q: any) => programQueries.find( (pq: any) => q.id === pq.id) ), 
        missing.map( (q: any) => programQueries.find( (pq: any) => q.id === pq.id) ),
        deleted.map( (q: any) => q.id)
      ]
    }, [])
    .do( ([present, missing, deleted]) => {
      console.log('\nPRESENT queries\n')
      console.log(present)

      console.log('\nDELETED IDs\n')
      console.log(deleted)

      console.log('\nMISSING queries\n')
      console.log(missing)
    })
    .do( _ => console.log('---------------------'))
    .flatMap( ([present, missing, deleted]) => {
      return Rx.Observable.concat(
        this.updateQueries(present, guid),
        this.registerQueries(missing, guid),
        this.deletePrograms(deleted)
      )
    })
    .timeout(20000)
    
  }

  private deletePrograms(guids: string[]) {
    if (guids.length === 0) return Rx.Observable.of([]);

    return Rx.Observable.of(guids)
      .flatMap(x => x)
      .map(id => {
        return this.client.delete({
          index: 'master_screener',
          type: 'queries',
          id: id
        })
      })
      .reduce( (accum, promise) => [promise, ...accum], [])
      .flatMap( promises => Promise.all(promises) )
  }

  deleteProgram(guid: string) {
    return this.getQueries(guid).toArray()
      .map(programQueries => programQueries.reduce( (accum: any, query: any) => [query.id, ...accum], []) )
      .flatMap( (ids: string[]) => this.deletePrograms(ids))
  }
}

function logObject(obj: Object) {
  for(const key in obj) {
    console.log(`logging: ${key}`)
    console.log(obj[key]);
    console.log('~~~~~~~~~~~~~~~')
  }
}