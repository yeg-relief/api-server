import * as Rx from 'rxjs/Rx';
import * as QueryConverter from './index';
import { UserProgram, ApplicationProgram, ProgramQuery, Condition, NumberCondition, BooleanCondition } from '../shared';
import { ScreenerRecord, ApplicationProgramRecord } from '../models';
import { ProgramCache } from '../cache';

const percolateParams: Elasticsearch.SearchParams = data => {
  return {
    index: 'master_screener',
    body: {
      query: {
        percolate: {
          field: 'query',
          document_type: 'queries',
          document: data
        }
      },
      _source: {
        includes: 'meta.*'
      }
    }
  }
}


export class NotificationEngine {
  private programCache: any;
  private client: Elasticsearch.Client;

  constructor(client: Elasticsearch.Client, cache: ProgramCache) {
    this.programCache = cache;
    this.client = client;
  }


  getQueries(programId: string): Rx.Observable<ProgramQuery[]> {
    const getAllPromise = this.client.search<any>({
      index: 'master_screener',
      body: {
        query: {
          match_all: {}
        }
      }
    })

    return Rx.Observable.fromPromise(getAllPromise)
      .filter(res => res.hits.total > 0)
      .map(res => res.hits.hits)
      .switchMap(x => x)
      .reduce( (queries: ProgramQuery[], source) => [QueryConverter.EsToQuery(source), ...queries], [])
      .timeout(10000)
  }

  percolate(data: any): Rx.Observable<UserProgram[]> {
    const promise = this.client.search<string[]>(percolateParams);
    const observable = Rx.Observable.fromPromise((promise));

    return observable
      .retry(3)
      .filter(response => response.hits.hits.length > 0)
      .map(resp => resp.hits.hits)
      .reduce((accum, hit: any) => [...hit._source.meta], [])
      .map((guids: string[]) => this.programCache.get(guids))
      .reduce((userPrograms: UserProgram[], applicationProgram: ApplicationProgram) => [applicationProgram.user, ...userPrograms], [])
      .timeout(10000);
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
      .timeout(10000)
  }

}