import { 
  IExpandableQuestion, INumberRadio, 
  IBooleanRadio, INumberInput, 
  ConcreteQuestion, IQuestion 
} from '../../interfaces';

import { 
  Question, validateFn, 
  QuestionFactory, NumberRadioQuestion, 
  BooleanRadioQuestion, NumberInputQuestion
} from './index';

export class ExpandableQuestion extends BooleanRadioQuestion implements IExpandableQuestion {
  expandable: boolean;
  conditonalQuestions: ConcreteQuestion[];

  constructor(question: IQuestion) {
    super(question);
    const q = <IExpandableQuestion>question;
    this.expandable = q.expandable;
    this.conditonalQuestions = QuestionFactory.createFromArray(q.conditonalQuestions);
  }


  validate(): boolean {
    for (let i = 0; i < this.conditonalQuestions.length; i++) {
      const question = this.conditonalQuestions[i];
      if(!validateFn(question)){
        return false;
      }
      if((<ExpandableQuestion>question).expandable === true || (<ExpandableQuestion>question).conditonalQuestions !== undefined){
        return false;
      }
    }

    return this.validateBooleanQuestion() && this.expandable === true;
  }
}