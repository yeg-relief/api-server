import { Question } from './index';

export type Screener = {
  created: number;
  questions: Question[];
  conditionalQuestions: Question[];
}