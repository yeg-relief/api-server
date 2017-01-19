import { IBooleanOption } from '../../interfaces';
import { QuestionOption } from './question-option';

export class BooleanOption extends QuestionOption implements IBooleanOption {
  display: string;
  value: boolean;

  constructor(option: IBooleanOption) {
    super(option);
    this.value = option.value;
  }

  static isBooleanOption(option: any): option is BooleanOption {
    return validationFunction(option);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(option: BooleanOption): boolean {
  return typeof option.value === 'boolean' && QuestionOption.isQuestionOption(option);
}