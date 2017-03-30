import * as test from 'tape';
import { NotificationEngine } from '../../../app/notification-engine/notification-engine';
import { ProgramCache } from '../../../app/cache';
import { ProgramQuery, Key, Condition } from '../../../app/shared/types';
import * as Rx from 'rxjs/Rx';
import * as elasticsearch from 'elasticsearch';

test('NotificationEngine#getQueries: can pull all queries from es and filter them to find target queries', t => {
    const fakeSearchResult = {
        hits: {
            hits: [
                {
                    _source: {
                        meta: { program_guid: 'target-program', id: 'target-program' },
                        query: {
                            bool: {
                                must: [{ term: { married: false } }]
                            }
                        }
                    }
                },
                {
                    _source: {
                        meta: { program_guid: 'other-program', id: 'other-program' },
                        query: {
                            bool: {
                                must: [{ term: { married: true } }]
                            }
                        }
                    }
                }
            ]
        }
    }
    const mockClient = { search: undefined };

    mockClient.search = (obj: any) => Promise.resolve(fakeSearchResult);

    const expected = {
        guid: 'target-program',
        id: 'target-program',
        conditions: [
            { key: { name: 'married', type: 'boolean' }, qualifier: undefined, value: false },
        ]
    };

    const notificationEngine = new NotificationEngine(<Elasticsearch.Client>mockClient, undefined);

    const queries = notificationEngine.getQueries('target-program');

    queries.subscribe(actual => {
        t.deepEquals(actual, expected);
        t.end();
    })
});