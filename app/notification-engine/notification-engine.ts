import * as Rx from 'rxjs/Rx';
import * as QueryConverter from './index';
import { UserProgram, ApplicationProgram, ProgramQuery, Condition, NumberCondition, BooleanCondition } from '../shared';
import { ScreenerRecord, ApplicationProgramRecord } from '../models';
import { ProgramCache } from '../cache';

const percolateParams = (data): Elasticsearch.SearchParams => {
  console.log(data);
  return {
    index: 'master_screener',
    body: {
      query: {
        percolate: {
          field: 'query',
          document_type: 'queries',
          document: { data }
        }
      },
      _source: {
        includes: 'meta.*'
      }
    }
  }
}

const TIMEOUT = 100000;

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
      body: {
        query: {
          match_all: {}
        }
      }
    })

    return Rx.Observable.fromPromise<Elasticsearch.SearchResponse<ProgramQuery>>(getAllPromise)
      .switchMap(res => Rx.Observable.from(res.hits.hits))
      .reduce( (sources, hit) => [hit._source, ...sources], [] )
      .reduce( (queries: ProgramQuery[], source) => [QueryConverter.EsToQuery(source), ...queries], [])
      .timeout(TIMEOUT)
  }

  percolate(data: any): Rx.Observable<string[]> {
    const promise = this.client.search<string[]>(percolateParams(data))

    const observable = Rx.Observable.fromPromise((promise));


    return observable
      .switchMap(res => Rx.Observable.from(res.hits.hits))
      .reduce((accum, hit: any) => [...hit._source.meta], [])
      .switchMap((guids: string[]) => this.programCache.getPrograms(guids))
      .timeout(TIMEOUT);
  }

  registerQueries(programQueries: ProgramQuery[], guid: string) {
    const esSearchQueries = Rx.Observable.from(programQueries.map(query => QueryConverter.queryToES(query)));
    const queries = Rx.Observable.from(programQueries);
    return Rx.Observable.zip(
      esSearchQueries,
      queries
    )
      .switchMap(([searchQuery, appQuery]) => {
        return Rx.Observable.from(this.client.create({
          index: 'master_screener',
          type: 'query',
          id: appQuery.guid,
          body: {
            searchQuery,
            meta: {
              program_guid: appQuery.guid
            }
          }
        }))
      })
      .reduce((allQueries, query) => [query, ...allQueries], [])
      .switchMap(queryArry => Rx.Observable.fromPromise(Promise.all(queryArry)))
      .timeout(TIMEOUT)
  }

}