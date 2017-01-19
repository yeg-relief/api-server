import { 
  Question, BooleanRadioQuestion, 
  NumberInputQuestion, NumberRadioQuestion,
  ExpandableQuestion 
} from '../models';
import { Factory } from '../interfaces';
import { tryValidation } from '../validation';
import { ConcreteQuestion, BaseInterface } from '../types';


export class QuestionFactory implements Factory {
  createFromObject(baseInterface: BaseInterface): ConcreteQuestion {
    let concreteQuestion: ConcreteQuestion;
    concreteQuestion = new BooleanRadioQuestion(<BooleanRadioQuestion>baseInterface);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new NumberRadioQuestion(<NumberRadioQuestion>baseInterface);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new NumberInputQuestion(<NumberInputQuestion>baseInterface);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new ExpandableQuestion(<ExpandableQuestion>baseInterface);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    return undefined;
  }

  createFromArray(baseInterfaceArray: BaseInterface[]): ConcreteQuestion[] {
    const concreteQuestions: ConcreteQuestion[] = baseInterfaceArray.map(question => this.createFromObject(question));
    const undefinedQuestion = concreteQuestions.find(q => q === undefined);
    const allQuestionsDefined: boolean = undefinedQuestion !== undefined;

    if (!allQuestionsDefined) {
      throw new Error('an invalid question!');
    }
    return concreteQuestions;
  }
}

