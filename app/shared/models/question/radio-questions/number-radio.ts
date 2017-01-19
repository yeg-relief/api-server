import { RadioQuestion } from './radio';
import { INumberRadio, IQuestion } from '../../../interfaces';
import { NumberOption } from '../../question-option';

export class NumberRadioQuestion extends RadioQuestion implements INumberRadio {
  options: NumberOption[];

  constructor(question: IQuestion){
    super(question);
    const q = <INumberRadio>question;
    this.options = NumberOption.createFromArray(q.options);
  }

  static isNumberRadioQuestion(question: any): question is NumberRadioQuestion {
    return validationFunction(question);
  }

  validate(){
    return validationFunction(this);
  }
}

function validationFunction(question: NumberRadioQuestion): boolean {
  return RadioQuestion.isRadioQuestion(question) && Array.isArray(question.options) && question.options.length > 0;
}