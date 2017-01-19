import { INumberInput, IQuestion } from '../../../interfaces';
import { Question } from '../index';

export class NumberInputQuestion extends Question implements INumberInput {
  value: number;
  controlType: 'input';

  constructor(question: IQuestion) {
    super(question);
    const q = <INumberInput>question;
    this.value = q.value;
    this.controlType = 'input';
  }

  static isNumberInput(question: any): question is NumberInputQuestion {
    return validateFunction(question);
  }

  validate(): boolean {
    return validateFunction(this);
  }
}

function validateFunction(question: NumberInputQuestion): boolean {

  return question.controlType === 'input' && typeof question.value === 'number' 
          && question.value >= 0 && Question.isQuestion(question);
}