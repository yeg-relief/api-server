import { IBooleanRadio, IExpandableQuestion, IQuestion } from '../../../interfaces';
import { RadioQuestion } from './radio';
import { BooleanOption } from '../../question-option';

export class BooleanRadioQuestion extends RadioQuestion implements IBooleanRadio {
  options: BooleanOption[];

  constructor(question: IQuestion) {
    super(question);
    const q = <IBooleanRadio>question;
    this.options = BooleanOption.createFromArray(q.options);
  }

  static isBooleanRadioQuestion(question: any): question is BooleanRadioQuestion {
    return validationFunction(question) && notExpandable(question);
  }

  validate(): boolean {
    return validationFunction(this) && notExpandable(this);
  }
}

function notExpandable(question: BooleanRadioQuestion): boolean {
  const castedQuestion = <IExpandableQuestion>(<IQuestion>question);
  return castedQuestion.expandable === undefined;
}

function validationFunction(question: BooleanRadioQuestion): boolean {
  const validOptions = (options: BooleanOption[]): boolean => {
    if (!Array.isArray(options) || options.length !== 2 ) {
      return false;
    }
    let truePresent = options.find(option => option.value === true);
    let falsePresent = options.find(option => option.value === false);
    if (truePresent === undefined || falsePresent === undefined) {
      return false;
    }
    return true;
  }

  return RadioQuestion.isRadioQuestion(question) && validOptions(question.options);
}