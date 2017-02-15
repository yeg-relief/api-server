import { IValidateable } from '../../../interfaces';
import { ExpandableQuestion } from '../../../types';
import { AbstractBooleanRadio, AbstractNumberInput, AbstractNumberRadio } from '../index';
import { isKey } from '../../../validation';

export abstract class AbstractExpandableQuestion implements IValidateable {
  question: ExpandableQuestion;

  protected constructor(question: any) {
    this.question = {...question};
  }

  static isExpandableQuestion(question: any): question is ExpandableQuestion {
    return validationFunction(question);
  }

  validate(): boolean {
    return validationFunction(this.question);
  }
}

// target for refactoring
function validationFunction(question: ExpandableQuestion): boolean {

  return question.expandable === true && AbstractBooleanRadio.isBooleanRadio(question) 
         && Array.isArray(question.conditonalQuestions) && question.conditonalQuestions.length > 0;
}