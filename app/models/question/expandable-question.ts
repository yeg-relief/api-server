import { IExpandableQuestion, INumberRadio, IBooleanRadio, INumberInput, ConcreteQuestion, IQuestion } from '../../interfaces';
import { NumberInputQuestion } from './input-question'
import { NumberRadioQuestion, BooleanRadioQuestion } from './radio-question';

export class ExpandableQuestion extends BooleanRadioQuestion implements IExpandableQuestion {
  expandable: boolean;
  conditonalQuestions: ConcreteQuestion[];

  constructor(question: IQuestion) {
    super(question);
    const q = <IExpandableQuestion>question;
    this.expandable = q.expandable;
    this.conditonalQuestions = this.constructConditionals(q.conditonalQuestions);
  }

  private 
  constructConditionals(question: ConcreteQuestion[]): ConcreteQuestion[]
  {
    return 
  }

  validate(): boolean {
    for(let i = 0; i < this.conditonalQuestions.length; i++){
      
    }

    return this.validateBooleanQuestion() && this.expandable === true; 
  }
}