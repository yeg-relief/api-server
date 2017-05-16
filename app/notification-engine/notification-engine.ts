import * as Rx from 'rxjs/Rx';
import * as QueryConverter from './index';
import { UserProgram, ApplicationProgram, ProgramQuery, Condition, NumberCondition, BooleanCondition } from '../shared';
import { ScreenerRecord, ApplicationProgramRecord } from '../models';
import { ProgramCache } from '../cache';
import { Client } from 'elasticsearch'


const PAGE_SIZE = 200;

const percolateParams = (data): Elasticsearch.SearchParams => {
  return {
    index: 'master_screener',
    size: PAGE_SIZE,
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


  getQueries(programId: string): Rx.Observable<ProgramQuery[]> {
    const getAllPromise = this.client.search<ProgramQuery>({
      index: 'master_screener',
      type: 'queries',
      size: PAGE_SIZE,
      body: {
        "bool": {
          "must" : [
            { "match": {"meta.program_guid" : programId} }
          ]
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

  registerQueries(programQueries: ProgramQuery[], guid: string): Rx.Observable<Elasticsearch.CreateDocumentResponse[]> {
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
        const query = (<any>Object).assign({}, searchQuery)
        const meta = {
          program_guid: appQuery.guid,
          id: appQuery.id
        }

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
    .flatMap( ([present, missing, deleted]) => {
      return Rx.Observable.merge(
        this.updateQueries(present, guid),
        this.registerQueries(missing, guid),
        this.deletePrograms(deleted)
      ).reduce( (accum, update) => [...accum, update], [])
    })
    
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