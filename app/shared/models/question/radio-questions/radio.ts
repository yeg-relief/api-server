import { Question } from '../question';
import { IRadioQuestion, IQuestion } from '../../../interfaces';

export class RadioQuestion extends Question implements IRadioQuestion {
  controlType: 'radio';

  protected constructor(question: IQuestion) {
    super(question)
    const q = <IRadioQuestion>question;
    this.controlType = q.controlType;
  }

  static isRadioQuestion(question: any): question is RadioQuestion {
    return validationFunction(question);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(question: RadioQuestion): boolean {
  return question.controlType === 'radio' && Question.isQuestion(question);
}