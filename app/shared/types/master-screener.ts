import { Question } from './index';

export type MasterScreener = {
  version: number;
  created: number;
  questions: Question[];
}