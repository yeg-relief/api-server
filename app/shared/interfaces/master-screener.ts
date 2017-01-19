import {IBooleanRadio, IExpandableQuestion, INumberRadio, INumberInput } from './question';

export interface IMasterScreener {
  version: number;
  created: number;
  questions: (IBooleanRadio | IExpandableQuestion | INumberRadio | INumberInput)[];
}