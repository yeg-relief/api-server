import * as test from 'tape';
import * as QueryConverter from '../../../app/notification-engine/query-converter';
import { ProgramQuery, Key, Condition } from '../../../app/shared/types';

test('convert application boolean query to ES query', t => {
    const key: Key = { name: 'children', type: 'boolean' };
    const conditions = [ { key, value: true }, { key, value: false } ];

    const input: ProgramQuery = {
        guid: 'a-fake-guid',
        id: 'random-string',
        conditions
    }

    const expected = {
        bool: {
            must: [
                { term: {children: false} },
                { term: {children: true} }
                
            ]
        }
    };

    const actual: any = QueryConverter.queryToES(input);
    t.deepEquals(actual, expected);
    t.end();
});

test('can handle all qualifies when converting application number query', t => {
    const key: Key = { name: 'income', type: 'number' };
    const value = 100;
    const conditions: Condition[]  = [ 
        { key, value, qualifier: 'lessThanOrEqual' },
        { key, value, qualifier: 'lessThan' },
        { key, value, qualifier: 'equal' },
        { key, value, qualifier: 'greaterThan' },
        { key, value, qualifier: 'greaterThanOrEqual' },
    ];

    const input: ProgramQuery = {
        guid: 'a-fake-guid',
        id: 'random-string',
        conditions
    };

    const expected = {
        bool: {
            must: [
                { range: { income: { gte: 100 } } },
                { range: { income: { gt: 100 } } },
                { term: { income: 100 } },
                { range: { income: { lt: 100 } } },
                { range: { income: { lte: 100 } } },
            ]
        }
    };

    const actual: any = QueryConverter.queryToES(input);
    t.deepEquals(actual, expected);
    t.end();
});

test('can convert a mixed application query to elasticsearch query', t => {
    const integerKey: Key = { name: 'income', type: 'integer' };
    const numberKey: Key = { name: 'number_children', type: 'number' };
    const booleanKey: Key = { name: 'married', type: 'boolean' };
    const value = 100;
    const conditions: Condition[]  = [ 
        { key: integerKey, value, qualifier: 'lessThanOrEqual' },
        { key: numberKey, value, qualifier: 'lessThan' },
        { key: booleanKey, value: true },
    ];

    const input: ProgramQuery = {
        guid: 'a-fake-guid',
        id: 'random-string',
        conditions
    };

    const expected = {
        bool : {
            must: [
                { term: { married: true} } ,
                { range: { number_children: { lt: 100 } } },
                { range: { income: { lte: 100 } } }
            ]
        }
    };

    const actual = QueryConverter.queryToES(input);
    t.deepEquals(actual, expected);
    t.end();
});

test('can convert an esquery to application query', t => {
    const val = 10;

    const input = [{
        meta: { program_guid: 'fake-guid', id: 'fake-id' },
        query: {
            bool: {
                must: [
                    { range: { income: { lt: val } } },
                    { term: { age: val } },
                    { term: { married: false } }
                ]
            }	
        }
    }];

    const expected: ProgramQuery[] = [{
        guid: 'fake-guid',
        id: 'fake-id',
        conditions: [
            { key: { name: 'income', type: 'number' }, qualifier: 'lessThan', value: val },
            { key: { name: 'age', type: 'number'}, qualifier: 'equal', value: val},
            { key: { name: 'married', type: 'boolean'}, qualifier: undefined, value: false},
        ] 
    }];

    const actual = QueryConverter.EsToQuery(input);

    t.deepEquals(actual, expected);
    t.end();
});

