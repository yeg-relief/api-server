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
      .switchMap(res => Rx.Observable.from(res.hits.hits))
      .filter( (res: any) => res._source.meta.program_guid === programId )
      .reduce( (sources, hit) => [hit._source, ...sources], [] )
      .reduce( (queries: ProgramQuery[], source) => [QueryConverter.EsToQuery(source), ...queries], [])
      .switchMap(x => x[0])
  }

  percolate(data: any): Rx.Observable<string[]> {
    console.log('NotificationEngine.percolate called');
    console.log(data);
    const promise = this.client.search<string[]>(percolateParams(data))

    const observable = Rx.Observable.fromPromise((promise));


    return observable
      .do(_ => console.log(_) )
      .switchMap(res => Rx.Observable.from(res.hits.hits))
      .do(_ => console.log(_) )
      .reduce((accum, hit: any) => [...hit._source.meta], [])
      .switchMap((guids: string[]) => this.programCache.getPrograms(guids))
  }

  registerQueries(programQueries: ProgramQuery[], guid: string) {
    const esSearchQueries = Rx.Observable.from(programQueries.map(query => QueryConverter.queryToES(query)));
    const queries = Rx.Observable.from(programQueries);
    return Rx.Observable.zip(
      esSearchQueries,
      queries
    )
      .switchMap(([searchQuery, appQuery]) => {
        const body = (<any>Object).assign({}, searchQuery)
        const meta = {
          program_guid: appQuery.guid,
          id: appQuery.id
        }
        body.meta = meta;

        return Rx.Observable.from(this.client.create({
          index: 'master_screener',
          type: 'queries',
          id: appQuery.id,
          body
        }))
      })
      .reduce((allQueries, query) => [query, ...allQueries], [])
      .switchMap(queryArry => Rx.Observable.fromPromise(Promise.all(queryArry)))
  }


  updateQueries(programQueries: ProgramQuery[], guid: string) {
    const esSearchQueries = Rx.Observable.from(programQueries.map(query => QueryConverter.queryToES(query)));
    const queries = Rx.Observable.from(programQueries);
    return Rx.Observable.zip(
      esSearchQueries,
      queries
    )
    .switchMap(([searchQuery, appQuery]) => {
        const body = (<any>Object).assign({}, searchQuery)
        const meta = {
          program_guid: appQuery.guid,
          id: appQuery.id
        }
        body.meta = meta;

        return Rx.Observable.from(this.client.index({
          index: 'master_screener',
          type: 'queries',
          id: appQuery.id,
          body
        }))
      })
      .reduce((allQueries, query) => [query, ...allQueries], [])
      .switchMap(queryArry => Rx.Observable.fromPromise(Promise.all(queryArry)))
  }

  updateProgram(programQueries, guid) {
    return Rx.Observable.zip(
      this.getQueries(guid).toArray(),
      Rx.Observable.from(programQueries).toArray()
    )
    .reduce( (accum, [registeredQueries, programQueries]) => {
      const present = registeredQueries.filter( (query: any) => programQueries.find( (pq: any) => pq.id === query.id) !== undefined );
      const deleted = registeredQueries.filter( (query: any) => programQueries.find( (pq: any) => pq.id === query.id) === undefined ); 
      const missing = programQueries.filter( (query: any) => registeredQueries.find( (rq: any) => rq.id === query.id) === undefined );
       return [
        present.map( (q: any) => programQueries.find( (pq: any) => q.id === pq.id) ), 
        missing.map( (q: any) => programQueries.find( (pq: any) => q.id === pq.id) ),
        deleted.map( (q: any) => q.id)
      ]
    }, [])
    .switchMap( ([present, missing, deleted]) => {
      return Rx.Observable.merge(
        this.updateQueries(present, guid),
        this.registerQueries(missing, guid),
        this.deletePrograms(deleted)
      )
    })
  }

  private deletePrograms(guids: string[]) {
    return Rx.Observable.of(guids)
      .switchMap(x => x)
      .map(id => {
        return this.client.delete({
          index: 'master_screener',
          type: 'query',
          id: id
        })
      })
      .reduce( (accum, promise) => [promise, ...accum], [])
      .switchMap( promises => Promise.all(promises) )
  }

  deleteProgram(guid: string) {
    return this.getQueries(guid).toArray()
      .map(programQueries => programQueries.reduce( (accum: any, query: any) => [query.id, ...accum], []) )
      .switchMap( (ids: string[]) => this.deletePrograms(ids))
  }

}