import * as test from 'tape';
import { UserProgramRecord } from '../../../app/models';
import { UserProgram } from '../../../app/shared';

test("UserProgramRecord holds a UserProgram internally", t => {
  const record = new UserProgramRecord(fakeUserProgram, undefined);
  t.deepEqual(record.getUserProgram(), fakeUserProgram);
  t.end();
});

test("userProgramRecord can index or update itself UserProgram to es", t => {
  const mockClient = {
    index: (obj: Object): Promise<Elasticsearch.CreateDocumentResponse> => {
      t.deepEquals(obj, {
        index: 'programs',
        type: 'user_facing',
        id: 'fake-guid-1',
        body: fakeUserProgram
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

  const userProgramRecord = new UserProgramRecord(fakeUserProgram, <Elasticsearch.Client>mockClient);
  // this is called when updating an existing UserProgram
  userProgramRecord.save().then(actual => {
    t.end();
  })
});

test('UserProgramRecord can create a document in es', t => {
  const expected: Elasticsearch.CreateDocumentResponse = {
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
      t.deepEquals(obj, {
        index: 'programs',
        type: 'user_facing',
        id: 'fake-guid-1',
        body: fakeUserProgram
      });

      return Promise.resolve(expected)
    }
  };

  const userProgramRecord = new UserProgramRecord(fakeUserProgram, <Elasticsearch.Client>mockClient);



  userProgramRecord.create().then(actual => {
    t.deepEqual(actual, expected);
    t.end();
  })
});

test('UserProgramRecord can get a document from es', t => {
  const expected: Elasticsearch.GetResponse<UserProgram> = {
    "_index": "programs",
    "_type": "user_facing",
    "_id": "fake-guid-1",
    "_version": 1,
    "found": true,
    "_source": {
      "title": "dsfsf",
      "details": "sdfsfsdf",
      "externalLink": "",
      "tags": [],
      "guid": "fake-guid-1",
      "created": 1491262503794
    }
  }

  const mockClient = {
    get: (obj: Object): Promise<Elasticsearch.GetResponse<UserProgram>> => {
      t.deepEquals(obj, {
        index: 'programs',
        type: 'user_facing',
        id: 'fake-guid-1',
      });

      return Promise.resolve(expected)
    }
  };

  UserProgramRecord.get('fake-guid-1', <Elasticsearch.Client>mockClient)
    .then(actual => {
      t.deepEqual(actual, expected._source);
      t.end();
    })
});

test('UserProgramRecord can get all userprograms', t => {
  const expected: Elasticsearch.SearchResponse<UserProgram> = {
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

  const expectedQuery = {
    index: 'programs',
    type: 'user_facing',
    body: { query: { match_all: {} } }
  };

  const mockClient = {
    search: (obj: any): Promise<Elasticsearch.SearchResponse<UserProgram>> => {
      t.deepEqual(obj, expectedQuery);
      return Promise.resolve(expected);
    }
  };

  UserProgramRecord.getAll(<Elasticsearch.Client>mockClient).then(actual => {
    t.deepEqual(actual, [fakeUserProgram])
    t.end();
  });
});


const fakeUserProgram: UserProgram = {
  created: 0,
  guid: 'fake-guid-1',
  title: 'fake-title',
  details: 'fake-details',
  externalLink: 'google.ca',
  tags: ['test', 'fake']
};