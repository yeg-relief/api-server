import { AbstractUserProgram, UserProgram, AbstractApplicationProgram, ApplicationProgram } from '../shared';
import { Record } from '../interfaces';
import { NotificationEngine } from '../notification-engine/notification-engine';
import * as Rx from 'rxjs/Rx';

export class UserProgramRecord extends AbstractUserProgram implements Record {
  client: Elasticsearch.Client;
  params = {
    index: 'programs',
    type: 'user_facing',
    id: undefined
  }

  constructor(program: UserProgram, client: Elasticsearch.Client) {
    super(program);
    this.client = client;
    this.params.id = program.guid;
  }

  getUserProgram(): UserProgram {
    return super.userProgram;
  }

  save(): Promise<Elasticsearch.CreateDocumentResponse> {
    return this.client.create({
      index: this.params.index,
      type: this.params.type,
      id: this.userProgram.guid,
      body: this.userProgram
    })
      .then(response => {
        if (response.created) {
          return Promise.resolve(response)
        }
        return Promise.reject(`program with ${this.userProgram.guid}: [failed save]`)
      })
  }

  find(id: string): Promise<UserProgram> {
    return this.client.get<UserProgram>({
      index: this.params.index,
      type: this.params.type,
      id: id
    })
      .then(response => response._source)
      .then(resp => {
        if (resp === undefined) {
          return Promise.reject(`unable to get _source for program with id: ${this.params.id}`)
        }
        return Promise.resolve(resp)
      })
  }

  static getAll(client: Elasticsearch.Client): Promise<UserProgram[]> {
    const getAllPrograms = {
      match_all: {}
    };

    return client.search({
      index: 'programs', 
      type: 'user_facing', 
      body: {
        getAllPrograms
      }
    })
    .then( (searchResult: Elasticsearch.SearchResponse<UserProgram>)  => searchResult.hits.hits)
    .then( hits => hits.reduce( (userPrograms, hit) => [hit._source, ...userPrograms], []) )
  }

  serialize(): string {
    if (this.validate()) {
      return JSON.stringify(this.userProgram)
    }
    return undefined;
  }

}

export class ApplicationProgramRecord extends AbstractApplicationProgram implements Record {
  client: Elasticsearch.Client;
  private notifications: NotificationEngine;
  private userProgram: UserProgramRecord;

  constructor(program: ApplicationProgram, client: Elasticsearch.Client) {
    super(program);
    this.userProgram = new UserProgramRecord(program.user, client);
    this.client = client;
  }

  getUserProgram(): UserProgram {
    return super.applicationProgram.user;
  }

  save(): Promise<any> {
    if (!this.validate()) {
      return Promise.reject('invalid program')
    }

    return Rx.Observable.fromPromise(this.userProgram.save())
      .switchMap(() => this.notifications.registerQueries(this.applicationProgram.queries, this.applicationProgram.user.guid))
      .timeout(10000)
      .toPromise()
  }

  create() {
    if (!this.validate()) {
      return Rx.Observable.throw(Rx.Observable.of('invalid program'));
    }
    const registerQueries = this.notifications.registerQueries(this.applicationProgram.queries, this.applicationProgram.user.guid);

    return registerQueries
      .switchMap(() => this.userProgram.save())
      .timeout(10000)
  }

  static find(id: string, client: Elasticsearch.Client, notifications: NotificationEngine) {
    const userProgram = client.get<ApplicationProgram>({
      index: 'programs',
      type: 'user_facing',
      id: id
    })
      .then(response => response._source)
      .then(resp => {
        if (resp === undefined) {
          return Promise.reject(`unable to get _source for program with id: ${id}`)
        }
        return Promise.resolve(resp)
      })

    const applicationProgram = notifications.getQueries(id);

    return Rx.Observable.zip(
      Rx.Observable.fromPromise(userProgram),
      applicationProgram
    )
    .map( ([userProgram, programQueries]) => {
      return {
        user: {...userProgram},
        queries: [...programQueries]
      }
    })
    .timeout(10000);
  }

  static getAll(client: Elasticsearch.Client, notifications: NotificationEngine) {
    const allUserPrograms = Rx.Observable.fromPromise(UserProgramRecord.getAll(client));

    allUserPrograms
      .switchMap(x => x)
      .concat((userProgram) => notifications.getQueries(userProgram.guid))
      .map( ([userProgram, programQueries]) => {
        return {
          user: {...userProgram},
          queries: [...programQueries]
        }
      })
      .retry(2)
      .timeout(10000)
  }
}