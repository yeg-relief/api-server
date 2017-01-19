import { ConcreteQuestion } from './index';

export type MasterScreener = {
  version: number;
  created: number;
  questions: ConcreteQuestion[];
}