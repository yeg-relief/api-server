import { IExpandableQuestion, INumberRadio, IBooleanRadio, INumberInput, ConcreteQuestion, IQuestion } from '../../interfaces';
import { NumberInputQuestion } from './input-question'
import { NumberRadioQuestion, BooleanRadioQuestion } from './radio-question';
import { Question } from './question';

export class ExpandableQuestion extends BooleanRadioQuestion implements IExpandableQuestion {
  expandable: boolean;
  conditonalQuestions: ConcreteQuestion[];

  constructor(question: IQuestion) {
    super(question);
    const q = <IExpandableQuestion>question;
    this.expandable = q.expandable;
    this.conditonalQuestions = constructConcreteQuestions(q.conditonalQuestions);
  }


  validate(): boolean {
    for (let i = 0; i < this.conditonalQuestions.length; i++) {
      if(!validateFn(this.conditonalQuestions[i])){
        return false;
      }
    }

    return this.validateBooleanQuestion() && this.expandable === true;
  }
}

function constructConcreteQuestion(question: IQuestion): ConcreteQuestion {
  let concreteQuestion;
  concreteQuestion = new BooleanRadioQuestion(question);
  if(validateFn(concreteQuestion)){
    return concreteQuestion;
  }

  concreteQuestion = new NumberRadioQuestion(question);
  if(validateFn(concreteQuestion)){
    return concreteQuestion;
  }

  concreteQuestion = new NumberInputQuestion(question)
  if(validateFn(concreteQuestion)){
    return concreteQuestion;
  }

  return undefined;
}

function validateFn(question: ConcreteQuestion): boolean {
  try {
    if (question.validate()) {
      return true;
    }
  } catch (error) {
    console.error(error)
  }
  return false;
}


function constructConcreteQuestions(questions: IQuestion[]): ConcreteQuestion[] {
  const concreteQuestions: ConcreteQuestion[] = questions.map(q => constructConcreteQuestion(q));
  const undef = concreteQuestions.find(q => q === undefined);
  if (undef !== undefined){
    throw new Error('an invalid question!');
  }
  return concreteQuestions;
}