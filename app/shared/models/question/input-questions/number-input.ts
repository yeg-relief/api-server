import { IInputQuestion, INumberInput, IQuestion } from '../../../interfaces';
import { InputQuestion } from './input-question';

export class NumberInputQuestion extends InputQuestion implements INumberInput {
  value: number;

  constructor(question: IQuestion) {
    super(question);
    const q = <INumberInput>question;
    this.value = q.value;
  }

  static isNumberInput(question: any): question is NumberInputQuestion {
    return validateFunction(question);
  }

  validate(): boolean {
    return validateFunction(this);
  }
}

function validateFunction(question: NumberInputQuestion): boolean {
  return typeof question.value === 'number' && question.value >= 0 && InputQuestion.isInputQuestion(question);
}