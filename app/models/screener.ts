import { AbstractScreener, Screener } from '../shared';
import { Record } from '../interfaces';
import { Key, isKey } from '../shared';
import * as guid from 'node-uuid';


export class ScreenerRecord extends AbstractScreener implements Record {
  client: Elasticsearch.Client;
  index = 'questions';
  type = 'screener';
  screener: Screener;
  constructor(screener: Screener, client: Elasticsearch.Client) {
    super(screener);
    // commenting out validation for test/exploration
    /*
    if (!this.validate()) {
      throw new Error('invalid screener parameter for ScreenerRecord');
    }*/
    this.client = client;
    this.screener = screener;
  }

  save(): Promise<Elasticsearch.CreateDocumentResponse> {
    const params: Elasticsearch.CreateDocumentParams = {
      body: this.screener,
      index: this.index,
      type: this.type,
    }

    return this.client.create(params);
  }

  getScreener(): Screener {
    return this.screener;
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

  validateUpload(keys: Key[]): boolean {
    for ( const question of this.screener.questions ) {
      if ( this.screener.questions.filter(q => q.key === question.key).length > 1 ) {
        throw new Error(`duplicate key with name ${question.key} found!`)
      }
    
      if ( this.screener.questions.filter(q => q.index === question.index).length > 1 ) {
        throw new Error(`duplicate entries for index ${question.index} found!`)
      }

      if (question.id.substring(0, 4) === 'temp') {
        question.id = guid.v4();
      }

      const key = keys.find( k => k.name === question.key )

      if (key.type === 'integer' && question.controlType === 'CheckBox') {
        throw new Error(`key with id: ${question.id} is type integer with control CheckBox`);
      }

      if (key.type === 'boolean' && question.controlType !== 'CheckBox') {
        throw new Error(`key with id: ${question.id} is type boolean without control CheckBox`);
      }

      if(question.label.length === 0) {
        throw new Error(`key with id: ${question.id} has a label of length 0`);
      }

      if(question.controlType === 'NumberSelect' && Array.isArray(question.options) && question.options.length === 0) {
        throw new Error(`key with id: ${question.id} is of ${question.controlType} and has 0 options.`);
      } else if (question.controlType === 'NumberSelect' && !Array.isArray(question.options)) {
        throw new Error(`key with id: ${question.id} is of ${question.controlType} and has invalid options`);
      }

      return true;
    }



    return;
  }
}