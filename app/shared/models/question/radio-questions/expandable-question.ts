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
  for (let i = 0; i < question.conditonalQuestions.length; i++) {
    const nestedQuestion = question.conditonalQuestions[i];
    
    if (nestedQuestion instanceof AbstractExpandableQuestion) {
      return false;
    }

    if (nestedQuestion instanceof AbstractNumberRadio) {
      if (!AbstractNumberRadio.isNumberRadioQuestion(nestedQuestion)){
        return false;
      }
    }

    if (nestedQuestion instanceof AbstractNumberInput) {
      if (!AbstractNumberInput.isNumberInput(nestedQuestion)){
        return false;
      }
    }

    if (nestedQuestion instanceof AbstractBooleanRadio) {
      if (!AbstractBooleanRadio.isBooleanRadio(nestedQuestion)){
        return false;
      }
    }
  }

  return question.expandable === true && AbstractBooleanRadio.isBooleanRadio(question);
}