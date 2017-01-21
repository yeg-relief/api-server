import { AbstractMasterScreener, MasterScreener } from '../shared';
import { Record } from '../interfaces';

export class ScreenerRecord extends AbstractMasterScreener implements Record {
  client: Elasticsearch.Client;
  index = 'questions';
  type = 'screener';

  constructor(screener: MasterScreener, client: Elasticsearch.Client) {
    super(screener);
    if (!this.validate()) {
      throw new Error('invalid screener parameter for MasterScreenerRecord');
    }
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

  getScreener(): MasterScreener {
    return this.validate() ? this.screener : undefined;
  }

  static getVersion(id: number, client: Elasticsearch.Client): Promise<MasterScreener> {
    if (id !== Number.parseInt(id.toString(), 10)) {
      return Promise.reject(`id: ${id} is an invalid screener id`);
    }

    const params: Elasticsearch.GetParams = {
      id: id.toString(),
      index: 'questions',
      type: 'screener'
    }

    return client.get<MasterScreener>(params)
      .then(response => response._source)
      .then(resp => {
        if (resp === undefined) {
          return Promise.reject(`unable to get _source for program with id: ${params.id}`)
        }
        return Promise.resolve(resp)
      })

  }

  serialize(): string {
    return this.validate() ? JSON.stringify(this.screener) : undefined;
  }


  private getAll(): Promise<MasterScreener[]> {
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