import {IExpandableQuestion, IQuestion } from '../../../interfaces';
import { BooleanRadioQuestion } from '../index';
import { ConcreteQuestion } from '../../../types';
import { QuestionFactory } from '../../../factories';

export class ExpandableQuestion extends BooleanRadioQuestion implements IExpandableQuestion {
  expandable: boolean;
  conditonalQuestions: ConcreteQuestion[];

  constructor(question: IQuestion) {
    super(question);
    const q = <IExpandableQuestion>question;
    this.expandable = q.expandable;
    // will throw error if any question can not be created
    this.conditonalQuestions = QuestionFactory.createFromArray(q.conditonalQuestions);
  }

  static isExpandableQuestion(question: any): question is ExpandableQuestion {
    return validationFunction(question);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(question: ExpandableQuestion): boolean {
  for (let i = 0; i < question.conditonalQuestions.length; i++) {
    const nestedQuestion = question.conditonalQuestions[i];
    if (!nestedQuestion.validate()) {
      return false;
    }
    // only one layer of nesting allowed
    if ((<ExpandableQuestion>nestedQuestion).expandable === true || Array.isArray((<ExpandableQuestion>nestedQuestion).conditonalQuestions)) {
      return false;
    }
  }

  return BooleanRadioQuestion.isBooleanRadioQuestion(question) && typeof this.expandable === 'boolean' && this.expandable === true;
}