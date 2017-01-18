import { Question } from './question';
import { IRadioQuestion, INumberRadio, IBooleanRadio, INumberOption, IQuestion } from '../../interfaces';
import { NumberOption, BooleanOption } from '../question-option';

class RadioQuestion extends Question implements IRadioQuestion {
  controlType: 'radio';

  constructor(question: IQuestion) {
    super(question)
    const q = <IRadioQuestion>question;
    this.controlType = q.controlType;
  }


  protected isRadioQuestion(): boolean {
    return this.isQuestion() && this.controlType === 'radio';
  }
}

export class NumberRadioQuestion extends RadioQuestion implements INumberRadio {
  options: NumberOption[];

  constructor(question: IQuestion){
    super(question);
    const q = <INumberRadio>question;
    this.options = NumberOption.createFromArray(q.options);
  }

  // options are validated with NumberOption.createFromArray
  validate(): boolean {
    // ensure the options are number radio questions...
    return this.isRadioQuestion() && this.options.length > 0;
  }
}

export class BooleanRadioQuestion extends RadioQuestion implements IBooleanRadio {
  options: BooleanOption[];

  constructor(question: IQuestion) {
    super(question);
    const q = <IBooleanRadio>question;
    this.options = BooleanOption.createFromArray(q.options);
  }

  protected validateBooleanQuestion(): boolean {
    const validOptions = (options: BooleanOption[]) => {
      let truePresent = options.find(option => option.value === true);
      let falsePresent = options.find(option => option.value === false);
      if (truePresent === undefined || falsePresent === undefined){
        return false;
      }
      return true;
    }

    return this.isRadioQuestion() && this.options.length === 2 && validOptions(this.options);
  }

  validate(): boolean {
    return this.validateBooleanQuestion();
  }
}