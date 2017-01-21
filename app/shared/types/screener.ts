import { Question } from './index';

export type Screener = {
  version: number;
  created: number;
  questions: Question[];
}