import { Component } from '@nestjs/common';
import { Client } from "elasticsearch";
import { ClientService } from "../db.elasticsearch/client.service"
import { ProgramDto } from "../Program"
import { Observable } from "rxjs/Observable";
import { ProgramService } from "../Program/program.service";
import uniqBy = require("lodash.uniqby")
import "rxjs/add/observable/fromPromise"
import "rxjs/add/operator/map"
import "rxjs/add/operator/mergeMap"
import "rxjs/add/operator/toArray"

/*
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
 */

@Component()
export class NotificationService {
    private readonly INDEX = "master_screener";
    private client: Client;
    private readonly baseParams = {
        index: this.INDEX,
        size: this.clientService.maxSize,
        body: {
            query: {
                percolate: {
                    field: 'query',
                    document_type: 'queries'
                }
            }
        },
        _source: {
            includes: 'meta.*'
        }
    };

    constructor(
        private readonly clientService: ClientService,
        private readonly programService: ProgramService
    ) {
        this.client = this.clientService.client;
    }

    private injectDocument(data: {[key:string]: number | boolean}): Object {
        const searchParams = {...this.baseParams};
        searchParams.body.query.percolate['document'] = {...data};
        return searchParams;
    }

    percolate(data: {[key:string]: number | boolean}): Observable<ProgramDto[]> {
        const params = this.injectDocument(data);
        return Observable.fromPromise(this.client.search(params))
            .map(res => res.hits.hits)
            .mergeMap(x => x)
            .map(hit => hit._source['meta'].program_guid)
            .toArray()
            .mergeMap(program_guids => this.programService.mGetByGuid(program_guids))
            .map(programs => uniqBy(programs, 'guid'))
            .map(deduplicatedPrograms => deduplicatedPrograms.sort( (a, b) => a.title.localCompare(b.title)))
    }
}