import * as test from 'tape';
import { NotificationEngine } from '../../../app/notification-engine/notification-engine';
import { ProgramCache } from '../../../app/cache';
import { ProgramQuery, Key, Condition, UserProgram } from '../../../app/shared/types';
import { UserProgramRecord } from '../../../app/models';

test('NotificationEngine#getQueries: can pull all queries from es and filter them to find target queries', t => {

    const mockClient = { search: (obj: any) => Promise.resolve(fakeSearchResult) };
    const expected = {
        guid: 'fake-guid-1',
        id: 'fake-id-1',
        conditions: [
            { key: { name: 'married', type: 'boolean' }, qualifier: undefined, value: false },
        ]
    };

    const notificationEngine = new NotificationEngine(<Elasticsearch.Client>mockClient, undefined);

    notificationEngine.getQueries('fake-guid-1')
        .subscribe(actual => {
            t.deepEquals(actual, expected);
            t.end();
        })
});

test('NotificationEngine#percolate can transform form data into a UserProgramArray', t => {

    const fakeData = {
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
            ]
        }
    };


    const mockClient = { search: (obj: any) => Promise.resolve(fakeData) };

    const seed = [
        new UserProgramRecord(target_program, undefined),
        new UserProgramRecord(other_program, undefined)
    ];
    const fakeCache = new ProgramCache(seed);

    const notificationEngine = new NotificationEngine(<Elasticsearch.Client>mockClient, fakeCache);
    const expected = [{
        guid: 'fake-guid-1',
        created: 1,
        title: 'target-title',
        details: 'target-details'
    }];

    notificationEngine.percolate({ fake_data: true })
        .subscribe(actual => {
            t.deepEquals(actual, expected)
            t.end();
        })


});

test('NotificationEngine#registerQueries will create queries in percolator index for ProgramQuery[]', t => {

    const expected = [fakeCreateResultQueryTwo, fakeCreateResultQueryOne];


    const mockClient = {
        create: (obj: any) => obj.id === 'fake-id-1' ?
            Promise.resolve(fakeCreateResultQueryOne) :
            Promise.resolve(fakeCreateResultQueryTwo)
    };
    const notification = new NotificationEngine(<Elasticsearch.Client>mockClient, undefined);

    notification.registerQueries(fakeQueryArray, 'fake-guid-1')
        .subscribe(actual => {
            t.deepEqual(actual, expected);
            t.end();
        })
});

test('NotificationEngine#updateQueries will update queries in percolator index for ProgramQuery[]', t => {

    const expected = [fakeUpdateResultQueryTwo, fakeUpdateResultQueryOne];

    const mockClient = {
        index: (obj: any) => obj.id === 'fake-id-1' ?
            Promise.resolve(fakeUpdateResultQueryOne) :
            Promise.resolve(fakeUpdateResultQueryTwo)
    };

    const notification = new NotificationEngine(<Elasticsearch.Client>mockClient, undefined);

    notification.updateQueries(fakeQueryArray, 'fake-guid-1')
        .subscribe(actual => {
            t.deepEqual(actual, expected);
            t.end();
        })

});

test('NotificationEngine#updateProgram', t => {
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
    const expected = [
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
    ]

    notification.updateProgram(fakeQueryArray, 'fake-guid-1')
        .subscribe(actual => {
            t.deepEquals(actual, expected)
            t.end();
        })


});

test('NotificationEngine#deleteProgram', t => {

    const mockClient = {
        search: (obj: any) => Promise.resolve(fakeSearchResult),
        delete: (obj: any) => Promise.resolve(fakeDeleteResult)
    };

    const notification = new NotificationEngine(<Elasticsearch.Client>mockClient, undefined);

    const expected = [{
        _shards: undefined,
        found: true,
        _index: 'master_screener',
        _type: 'queries',
        _id: 'fake-id-1',
        _version: 1,
        result: 'deleted' // not sure if this is accurate result
    }]

    notification.deleteProgram('fake-guid-1')
        .subscribe(actual => {
            t.deepEqual(actual, expected);
            t.end();
        });
})



/** These are test fixtures? */

const fakeDeleteResult: Elasticsearch.DeleteDocumentResponse = {
    _shards: undefined,
    found: true,
    _index: 'master_screener',
    _type: 'queries',
    _id: 'fake-id-1',
    _version: 1,
    result: 'deleted' // not sure if this is accurate result
}

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

// not sure on what result property should actually be
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

var fakeSearchResult = {
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

const target_program: UserProgram = {
    guid: 'fake-guid-1',
    created: 1,
    title: 'target-title',
    details: 'target-details',
}

const other_program: UserProgram = {
    guid: 'fake-guid-2',
    created: 0,
    title: 'other-title',
    details: 'other-details',
}

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