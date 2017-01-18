import { IInputQuestion, INumberInput, IQuestion } from '../../interfaces';
import { Question } from './question';

class InputQuestion extends Question implements IInputQuestion {
  controlType: 'input';

  constructor(question: IQuestion){
    super(question);
    const q = <IInputQuestion>question;
    this.controlType = q.controlType;
  }

  protected isInputQuestion(): boolean {
    return this.isQuestion() && this.controlType === 'input';
  }
}

export class NumberInputQuestion extends InputQuestion implements INumberInput {
  value: number;

  constructor(question: IQuestion) {
    super(question);
    const q = <INumberInput>question;
    this.value = q.value;
  }

  validate(): boolean {
    return this.isInputQuestion() && this.value >= 0;
  }
}