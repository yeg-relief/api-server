import { INumberOption, IBooleanOption } from '../../interfaces';
import { QuestionOption } from './question-option';

export class NumberOption extends QuestionOption implements INumberOption {
  display: string;
  value: number;

  constructor(option: INumberOption) {
    super(option);
    this.value = option.value;
  }

  static isNumberOption(option: any): option is NumberOption {
    return validationFunction(option);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(option: NumberOption): boolean {
  return typeof option.value === 'number' && option.value >= 0 && QuestionOption.isQuestionOption(option);
}