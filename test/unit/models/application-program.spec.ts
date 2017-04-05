import * as test from 'tape';
import { ApplicationProgramRecord } from '../../../app/models';
import { ApplicationProgram, ProgramQuery, UserProgram } from '../../../app/shared';
import { ProgramCache } from '../../../app/cache';
import { NotificationEngine } from '../../../app/notification-engine';

test('ApplicationProgramRecord holds an internal user program', t => {
  const record = new ApplicationProgramRecord(fakeApplicationProgram, undefined, undefined);
  const userProgram = record.getUserProgram();
  t.deepEqual(userProgram, fakeApplicationProgram.user);
  t.end();
})

test('ApplicationProgramRecord can create a user_program and register queries associated to that program', t => {
  const expectedNotification = [fakeCreateResultQueryTwo, fakeCreateResultQueryOne];


  const mockNotificationClient = {
    create: (obj: any) => obj.id === 'fake-id-1' ?
      Promise.resolve(fakeCreateResultQueryOne) :
      Promise.resolve(fakeCreateResultQueryTwo)
  };
  const notification = new NotificationEngine(<Elasticsearch.Client>mockNotificationClient, undefined);

  const expectedUser: Elasticsearch.CreateDocumentResponse = {
    "_shards": {
      "total": 2,
      "failed": 0,
      "successful": 2
    },
    "_index": "programs",
    "_type": "user_facing",
    "_id": "fake-guid-1",
    "_version": 1,
    "created": true,
    "result": "created"
  }

  const mockClient = {
    create: (obj: Object): Promise<Elasticsearch.CreateDocumentResponse> => {
      // the time will be different...
      const body = { ...fakeApplicationProgram.user };
      body.created = obj['body']['created'];
      t.deepEquals(obj, {
        index: 'programs',
        type: 'user_facing',
        id: 'fake-guid-1',
        body: body
      });

      return Promise.resolve(expectedUser)
    }
  };

  const record = new ApplicationProgramRecord(
    fakeApplicationProgram,
    <Elasticsearch.Client>mockClient,
    notification
  );

  const expectedCreate = {
    _shards: { total: 2, failed: 0, successful: 2 },
    _index: 'programs',
    _type: 'user_facing',
    _id: 'fake-guid-1',
    _version: 1,
    created: true,
    result: 'created'
  }

  record.create().subscribe(
    actual => t.deepEqual(actual, expectedCreate),
    error => console.error(error),
    () => t.end()
  )
});

test('ApplicationProgramRecord can update a programs user_program document and associated queries', t => {
  const mockRecordClient = {
    index: (obj: Object): Promise<Elasticsearch.CreateDocumentResponse> => {
      const body = { ...fakeApplicationProgram.user };
      body.created = obj['body']['created'];


      t.deepEquals(obj, {
        index: 'programs',
        type: 'user_facing',
        id: 'fake-guid-1',
        body: body
      });

      return Promise.resolve({
        "_shards": {
          "total": 2,
          "failed": 0,
          "successful": 2
        },
        "_index": "programs",
        "_type": "user_facing",
        "_id": "fake-guid-1",
        "_version": 2,
        "created": false,
        "result": "updated"
      })
    }
  };

  const mockClient = {
    search: (obj: any) => Promise.resolve(fakeSearchResult),

    create: (obj: any) => obj.id === 'fake-id-1' ?
      Promise.resolve(fakeCreateResultQueryOne) :
      Promise.resolve(fakeCreateResultQueryTwo),

    index: (obj: any) => obj.id === 'fake-id-1' ?
      Promise.resolve(fakeUpdateResultQueryOne) :
      Promise.resolve(fakeUpdateResultQueryTwo)
  };

  const notification = new NotificationEngine(<Elasticsearch.Client>mockClient, undefined);
  const expectedNotification = [
    [],
    [
      {
        _shards: undefined,
        _index: 'master_screener',
        _type: 'queries',
        _id: 'fake-id-1',
        _version: 2,
        created: false,
        result: 'updated'
      }
    ],
    [
      {
        _shards: undefined,
        _index: 'master_screener',
        _type: 'queries',
        _id: 'fake-id-2',
        _version: 1,
        created: true,
        result: 'created'
      }
    ]
  ];

  const record = new ApplicationProgramRecord(
    fakeApplicationProgram,
    <Elasticsearch.Client>mockRecordClient,
    notification
  );

  record.save().then(actual => {
    t.deepEqual(actual, expectedNotification);
    t.end();
  })
    .catch(error => t.fail())
});

test('ApplicationProgramRecord can get all ApplicationPrograms', t => {
  const expectedRecordResult: Elasticsearch.SearchResponse<UserProgram> = {
    "took": 4,
    "timed_out": false,
    "_shards": {
      "total": 5,
      "successful": 5,
      "failed": 0
    },
    "hits": {
      "total": 1,
      "max_score": 1,
      "hits": [
        {
          "_index": "programs",
          "_type": "user_facing",
          "_id": "fake-guid-1",
          "_score": 1,
          "_version": 1,
          "_source": fakeUserProgram
        }
      ]
    }
  };

  const expectedRecordQuery = {
    index: 'programs',
    type: 'user_facing',
    body: { query: { match_all: {} } }
  };

  const mockRecordClient = {
    search: (obj: any): Promise<Elasticsearch.SearchResponse<UserProgram>> => {
      t.deepEqual(obj, expectedRecordQuery);
      return Promise.resolve(expectedRecordResult);
    }
  };

  const mockNotificationClient = { search: (obj: any) => Promise.resolve(fakeSearchResult) };

  const expectedNotification = [{
    guid: 'fake-guid-1',
    id: 'fake-id-1',
    conditions: [
      { key: { name: 'married', type: 'boolean' }, qualifier: undefined, value: false },
    ]
  }];

  const notification = new NotificationEngine(<Elasticsearch.Client>mockNotificationClient, undefined);
  ApplicationProgramRecord.getAll(<Elasticsearch.Client>mockRecordClient, notification)
    .subscribe( actual => {
      t.deepEqual(actual, [{
        guid: 'fake-guid-1',
        user: fakeUserProgram,
        queries: expectedNotification
      }])
      t.end();
    })

});




const fakeUserProgram: UserProgram = {
  created: 0,
  guid: 'fake-guid-1',
  title: 'fake-title',
  details: 'fake-details',
  externalLink: 'google.ca',
  tags: ['test', 'fake']
};


const fakeUpdateResultQueryOne: Elasticsearch.CreateDocumentResponse = {
  _shards: undefined,
  _index: 'master_screener',
  _type: 'queries',
  _id: 'fake-id-1',
  _version: 2,
  created: false,
  result: 'updated'
};

const fakeUpdateResultQueryTwo: Elasticsearch.CreateDocumentResponse = {
  _shards: undefined,
  _index: 'master_screener',
  _type: 'queries',
  _id: 'fake-id-2',
  _version: 2,
  created: false,
  result: 'updated'
};


const fakeSearchResult = {
  hits: {
    hits: [
      {
        _source: {
          meta: { program_guid: 'fake-guid-1', id: 'fake-id-1' },
          query: {
            bool: {
              must: [{ term: { married: false } }]
            }
          }
        }
      },
      {
        _source: {
          meta: { program_guid: 'fake-guid-2', id: 'fake-id-2' },
          query: {
            bool: {
              must: [{ term: { married: true } }]
            }
          }
        }
      }
    ]
  }
};




const fakeQueryArray: ProgramQuery[] = [
  {
    guid: 'fake-guid-1',
    id: 'fake-id-1',
    conditions: [
      { key: { name: 'married', type: 'boolean' }, qualifier: undefined, value: true },
      { key: { name: 'children', type: 'boolean' }, value: false },
      { key: { name: 'income', type: 'integer' }, qualifier: 'equal', value: 1000 },
      { key: { name: 'num_children', type: 'number' }, qualifier: 'equal', value: 3 }
    ]
  },
  {
    guid: 'fake-guid-1',
    id: 'fake-id-2',
    conditions: [
      { key: { name: 'bleh', type: 'integer' }, qualifier: 'equal', value: 1000 },
      { key: { name: 'blah', type: 'number' }, qualifier: 'lessThanOrEqual', value: 1600 }
    ]
  }
];

const fakeApplicationProgram: ApplicationProgram = {
  user: {
    created: 0,
    guid: 'fake-guid-1',
    title: 'fake-title',
    details: 'fake-details',
    externalLink: 'google.ca',
    tags: ['test', 'fake']
  },
  queries: [...fakeQueryArray]
};

const fakeCreateResultQueryOne: Elasticsearch.CreateDocumentResponse = {
  _shards: undefined,
  _index: 'master_screener',
  _type: 'queries',
  _id: 'fake-id-1',
  _version: 1,
  created: true,
  result: 'created'
};

const fakeCreateResultQueryTwo: Elasticsearch.CreateDocumentResponse = {
  _shards: undefined,
  _index: 'master_screener',
  _type: 'queries',
  _id: 'fake-id-2',
  _version: 1,
  created: true,
  result: 'created'
};