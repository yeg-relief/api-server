import { AbstractScreener, Screener } from '../shared';
import { Record } from '../interfaces';

export class ScreenerRecord extends AbstractScreener implements Record {
  client: Elasticsearch.Client;
  index = 'questions';
  type = 'screener';

  constructor(screener: Screener, client: Elasticsearch.Client) {
    super(screener);
    console.log(screener);
    // commenting out validation for test/exploration
    /*
    if (!this.validate()) {
      throw new Error('invalid screener parameter for ScreenerRecord');
    }*/
    this.client = client;
  }

  save(): Promise<Elasticsearch.CreateDocumentResponse> {
    const params: Elasticsearch.CreateDocumentParams = {
      body: this.screener,
      index: this.index,
      type: this.type,
      id: this.screener.version.toString()
    }

    return this.client.create(params);
  }

  getScreener(): Screener {
    return this.validate() ? this.screener : undefined;
  }

  static getVersion(id: number, client: Elasticsearch.Client): Promise<Screener> {
    if (id !== Number.parseInt(id.toString(), 10)) {
      return Promise.reject(`id: ${id} is an invalid screener id`);
    }

    const params: Elasticsearch.GetParams = {
      id: id.toString(),
      index: 'questions',
      type: 'screener'
    }

    return client.get<Screener>(params)
      .then(response => response._source)
      .then(resp => {
        if (resp === undefined) {
          return Promise.reject(`unable to get _source for program with id: ${params.id}`)
        }
        return Promise.resolve(resp)
      })

  }

  serialize(): string {
    // commenting out validation for test/exploration 
    //return this.validate() ? JSON.stringify(this.screener) : undefined;
    return JSON.stringify(this.screener);  
  }


  private getAll(): Promise<Screener[]> {
    const params: Elasticsearch.SearchParams = {
      index: this.index,
      type: this.type,
      body: {
        match_all: {}
      }
    }

    return this.client.search(params)
      .then( results => [...results.hits.hits])
      .then( hits => hits.reduce( (accum, hit) => accum = [hit._source, ...accum], []))
  }
}