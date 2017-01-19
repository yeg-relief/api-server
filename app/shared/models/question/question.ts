import { IQuestion, IValidateable } from '../../interfaces';
import { BooleanRadioQuestion, NumberRadioQuestion } from './radio-questions';
import { NumberInputQuestion } from './input-questions';
import { ConcreteQuestion } from '../../types';

export class Question implements IQuestion, IValidateable {
  label: string;
  key: string;

  protected constructor(question: IQuestion){
    this.label = question.label;
    this.key = question.key;
  }

  static isQuestion(question: any): question is Question {
    return validationFunction(question);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(question: IQuestion): boolean {
  // should I check if key is in elasticsearch?
  return typeof this.label === 'string' && typeof this.key === 'string';
}
