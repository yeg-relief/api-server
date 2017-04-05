import { AbstractUserProgram, UserProgram, AbstractApplicationProgram, ApplicationProgram, ProgramMetaData } from '../shared';
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
  userProgram: UserProgram;

  constructor(program: any, client: Elasticsearch.Client) {
    
    super(program);
    this.userProgram = { ...program };
    this.client = client;
    this.params.id = program.guid;
  }

  getUserProgram(): UserProgram {
    return this.userProgram;
  }

  save() {
    return this.client.index({
      index: this.params.index,
      type: this.params.type,
      id: this.userProgram.guid,
      body: this.userProgram
    })
  }

  create(): Promise<Elasticsearch.CreateDocumentResponse> {
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
        return Promise.reject(`program with ${this.userProgram.guid}: [failed create]`)
      })
  }

  static get(id: string, client: Elasticsearch.Client): Promise<UserProgram> {
    return client.get<UserProgram>({
      index: 'programs',
      type: 'user_facing',
      id
    })
      .then(response => response._source)
      .then(resp => {
        if (resp === undefined) {
          return Promise.reject(`unable to get _source for program with id: ${id}`)
        }
        return Promise.resolve(resp)
      })
  }

  static getAll(client: Elasticsearch.Client): Promise<UserProgram[]> {

    return client.search({
      index: 'programs', 
      type: 'user_facing', 
      body: { query: { match_all: {} } } 
    })
    .then( (searchResult: Elasticsearch.SearchResponse<UserProgram>)  => searchResult.hits.hits)
    .then( hits => hits.reduce( (userPrograms, hit) => [hit._source, ...userPrograms], []) )
  }

  serialize(): string {
    return JSON.stringify(this.userProgram)
  }

  static delete(client: Elasticsearch.Client, guid) {
    const promise = client.delete({
      index: 'programs',
      type: 'user_facing',
      id: guid
    })
    
    return Rx.Observable.fromPromise(promise);
  }

}

export class ApplicationProgramRecord extends AbstractApplicationProgram implements Record {
  client: Elasticsearch.Client;
  private userProgram: UserProgramRecord;

  constructor(program: ApplicationProgram, client: Elasticsearch.Client, private notifications: NotificationEngine) {
    super(program);
    this.userProgram = new UserProgramRecord(program.user, client);
    this.client = client;
    this.setMetaData();
  }

  getUserProgram(): UserProgram {
    return this.applicationProgram.user;
  }

  save(): Promise<any> {
    return Rx.Observable.fromPromise(this.userProgram.save())
      .flatMap(() => this.notifications.updateProgram(this.applicationProgram.queries, this.applicationProgram.user.guid))
      .toPromise()
  }

  create() {
    const registerQueries = this.notifications.registerQueries(this.applicationProgram.queries, this.applicationProgram.user.guid);
    return registerQueries.flatMap(() => this.userProgram.create())
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

    const applicationProgram = notifications.getQueries(id).toArray();

    return Rx.Observable.zip(
      Rx.Observable.fromPromise(userProgram),
      applicationProgram
    )
    .map( ([userProgram, programQueries]) => {
      return {
        user: {...userProgram},
        queries: [...programQueries]
      }
    });
  }

  // untested and unused ??
  static delete(client: Elasticsearch.Client, notifications: NotificationEngine, guid) {
    return Rx.Observable.zip(
      UserProgramRecord.delete(client, guid),
      notifications.deleteProgram(guid)
    );
  }

  static getAll(client: Elasticsearch.Client, notifications: NotificationEngine) {
    const allUserPrograms = Rx.Observable.fromPromise(UserProgramRecord.getAll(client));

    return allUserPrograms
      .take(1)
      .flatMap(x => x)
      .flatMap(userProgram => {
        return Rx.Observable.forkJoin(
          Rx.Observable.of(userProgram.guid),
          notifications.getQueries(userProgram.guid).toArray(),
          Rx.Observable.of(userProgram)
        )
      })
      .map( ([guid, queries, user]) => {
        return {
          guid: guid,
          user: user,
          queries: queries
        }
      })
      .toArray()
      .catch(_ => Rx.Observable.of([]))
  }

  setMetaData() {
    if (this.applicationProgram.user.guid === 'new'){
      ProgramMetaData.setProgramGuid(this.applicationProgram.user);

      const programGUID = this.applicationProgram.user.guid;
      this.userProgram.getUserProgram().guid = programGUID;
      for(let i = 0; i < this.applicationProgram.queries.length; i++) {
        this.applicationProgram.queries[i].guid = programGUID;
      }
    }
    ProgramMetaData.setCreationDate(this.applicationProgram.user); 
  }
}