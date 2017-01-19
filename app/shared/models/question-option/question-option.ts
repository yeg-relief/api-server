import { IQuestionOption, IValidateable } from '../../interfaces';

export class QuestionOption implements IQuestionOption, IValidateable {
  display: string;

  constructor(option: IQuestionOption) {
    this.display = option.display;
  }

  static isQuestionOption(option: any): option is QuestionOption {
    return validationFunction(option);
  }

  validate(): boolean {
    return validationFunction(this)
  }
}

function validationFunction(option: QuestionOption): boolean {
  return typeof this.display === 'string';
}