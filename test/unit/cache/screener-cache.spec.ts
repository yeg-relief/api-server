import * as test from 'tape';
import { ScreenerCache } from '../../../app/cache';
import { ScreenerRecord } from '../../../app/models';
import { Screener, Question  } from '../../../app/shared';



test('screenerRecord', t => {
  const fakeCache = new ScreenerCache(new ScreenerRecord(fakeScreener, undefined));

  fakeCache.get().subscribe( actual => {
    t.deepEqual(actual, fakeScreener);
  });

  const updatedScreener = (function(): Screener {
    const questions = fakeConstantQuestions
                                        .filter( q => q.id !== 'fake-id-1')
                                        .map(q => (<any>Object).assign({}, q));
    const conditionalQuestions = fakeConstantQuestions.map(q => (<any>Object).assign({}, q));
    const created = 1;
    return {
      questions,
      conditionalQuestions,
      created
    };
  })();

  fakeCache.update(new ScreenerRecord(updatedScreener, undefined));
  fakeCache.get().subscribe( actual => {
    t.deepEqual(actual, updatedScreener);
  });
  t.end();
})




const fakeConstantQuestions: Question[] = [
  {
    controlType: 'NumberInput',
    id: 'fake-id-1',
    key: 'income',
    index: 0,
    label: 'What is your income?',
    options: []
  },
  {
    controlType: 'CheckBox',
    id: 'fake-id-2',
    key: 'children',
    index: 1,
    label: 'Do you have children?',
    options: [],
    conditonalQuestions: [ 'fake-id-3' ]
  },
];

const fakeConditionalQuestions: Question[] = [
  {
    controlType: 'NumberSelect',
    id: 'fake-id-3',
    key: 'num_children',
    index: 0,
    label: 'How many children do you have?',
    options: [
      {value: 1, display: '1'},
      {value: 2, display: '2'},
      {value: 3, display: '3'},
    ]
  }
];


const fakeScreener: Screener = {
  created: 0,
  questions: [...fakeConstantQuestions],
  conditionalQuestions: [...fakeConditionalQuestions]
};