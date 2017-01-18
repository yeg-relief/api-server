import { IQuestionOption } from '../../interfaces';

export class QuestionOption implements IQuestionOption {
  display: string;

  constructor(option: IQuestionOption) {
    this.display = option.display;
  }

  protected validQuestion(): boolean {
    return typeof this.display === 'string';
  }
}