import { IInputQuestion, IQuestion } from '../../../interfaces';
import { Question } from '../question';

export class InputQuestion extends Question implements IInputQuestion {
  controlType: 'input';

  constructor(question: IQuestion){
    super(question);
    const q = <IInputQuestion>question;
    this.controlType = q.controlType;
  }

  static isInputQuestion(question: any): question is InputQuestion {
    return validationFunction(question);
  }

  validate(): boolean {
    return validationFunction(this)
  }
}

function validationFunction(question: InputQuestion): boolean {
  return this.controlType === 'input' && Question.isQuestion(question)
}