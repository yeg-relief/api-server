import { IValidateable } from '../../../interfaces';
import { NumberRadio } from '../../../types';
import { isKey } from '../../../validation';

export abstract class AbstractNumberRadio implements IValidateable {
  question: NumberRadio;

  protected constructor(question: any){
    this.question = {...question};
  }

  static isNumberRadioQuestion(question: any): question is NumberRadio {
    return validationFunction(question);
  }

  validate(){
    return validationFunction(this.question);
  }
}

function validationFunction(question: NumberRadio): boolean {
  return isKey(question.key) && typeof question.label === 'string' 
        && Array.isArray(question.options) && question.options.length > 0 && question.controlType === 'NumberSelect'
        && typeof question.index === 'number' && question.index > 0; 
}