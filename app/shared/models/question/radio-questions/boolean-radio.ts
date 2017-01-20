import { IValidateable } from '../../../interfaces';
import { BooleanRadio, ExpandableQuestion, BooleanOption } from '../../../types';
import { isKey } from '../../../validation';

export abstract class AbstractBooleanRadio implements IValidateable {
  question: BooleanRadio;

  protected constructor(question: any) {
    this.question = {...question};
  }

  static isBooleanRadio(question: any): question is BooleanRadio {
    return validationFunction(question) && notExpandable(question);
  }

  validate(): boolean {
    return validationFunction(this.question) && notExpandable(this.question);
  }
}

function notExpandable(question: BooleanRadio): boolean {
  return (<ExpandableQuestion>question).expandable === undefined;
}

function validationFunction(question: BooleanRadio): boolean {
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

  return  isKey(question.key) && validOptions(question.options) 
          && typeof question.label === 'string' && question.controlType === 'radio';
}