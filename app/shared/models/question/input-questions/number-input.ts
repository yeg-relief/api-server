import { IValidateable } from '../../../interfaces';
import { NumberInput } from '../../../types';
import { isKey } from '../../../validation';

export abstract class AbstractNumberInput implements IValidateable {
  question: NumberInput;

  protected constructor(question: any) {
    this.question = {...question};
  }

  static isNumberInput(question: any): question is AbstractNumberInput {
    return validateFunction(question);
  }

  validate(): boolean {
    return validateFunction(this.question);
  }
}

function validateFunction(question: NumberInput): boolean {

  return question.controlType === 'input' && typeof question.value === 'number' 
          && question.value >= 0 && isKey(question.key) && typeof question.label === 'string';
}