import { IQuestion, ConcreteQuestion } from '../../interfaces';
import { BooleanRadioQuestion, NumberRadioQuestion } from './radio-question';
import { NumberInputQuestion } from './input-question';

export class Question implements IQuestion {
  label: string;
  key: string;

  constructor(question: IQuestion){
    this.label = question.label;
    this.key = question.key;
  }

  protected isQuestion(): boolean {
    // should I check if key is in elasticsearch?
    return typeof this.label === 'string' && typeof this.key === 'string';
  }
}
