import * as test from 'tape';
import { ProgramCache } from '../../../app/cache';
import { UserProgramRecord } from '../../../app/models';
import { UserProgram  } from '../../../app/shared'


test('ProgramCache takes an array of UserProgramRecords as a seed', t => {
  const cache = new ProgramCache(userProgramRecords);
  cache.getAllSerializedPrograms().subscribe( actual => {
    t.deepEqual(actual, [target_program, other_program])
  })

  cache.getPrograms(['fake-guid-1']).subscribe( actual => {
    t.deepEqual(actual, [target_program])
  })
  // fails silently on miss
  cache.getPrograms(['fake-guid-1', 'fake-guid-3']).subscribe( actual => {
    t.deepEqual(actual, [target_program])
    t.end();
  })
});

test('ProgramCache takes an update', t => {
  const cache = new ProgramCache([]);
  const expected = [target_program];

  cache.updatePrograms([new UserProgramRecord(target_program, undefined)]);
  cache.getAllSerializedPrograms().subscribe( actual => {
    t.deepEqual(actual, expected)
  });

  cache.updatePrograms(undefined);
  cache.getAllSerializedPrograms().subscribe( actual => {
    t.deepEqual(actual, expected)
    
  });

  cache.updatePrograms([new UserProgramRecord(target_program, undefined)]);
  cache.getAllSerializedPrograms().subscribe( actual => {
    t.deepEqual(actual, expected)
    t.end();
  });
});

test('Program cache can delete an entry', t => {
  const cache = new ProgramCache([new UserProgramRecord(target_program, undefined)]);
  const expected = [];

  cache.deleteProgram(target_program.guid)
  cache.getAllSerializedPrograms().subscribe( actual => {
    t.deepEqual(actual, expected);
  });

  cache.deleteProgram(target_program.guid)
  cache.getAllSerializedPrograms().subscribe( actual => {
    t.deepEqual(actual, expected);
    t.end();
  });
});




const target_program: UserProgram = {
    guid: 'fake-guid-1',
    created: 1,
    title: 'target-title',
    details: 'target-details',
};

const other_program: UserProgram = {
    guid: 'fake-guid-2',
    created: 0,
    title: 'other-title',
    details: 'other-details',
};

const userProgramRecords = [
  new UserProgramRecord(target_program, undefined),
  new UserProgramRecord(other_program, undefined)
];