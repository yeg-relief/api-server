import { 
  Question, BooleanRadioQuestion, 
  NumberInputQuestion, NumberRadioQuestion,
  ExpandableQuestion 
} from '../models';
import { IQuestion } from '../interfaces';
import { tryValidation } from '../validation';
import { ConcreteQuestion } from '../types';


export class QuestionFactory {
  static CreateFromData(question: IQuestion): ConcreteQuestion {
    let concreteQuestion: ConcreteQuestion;
    concreteQuestion = new BooleanRadioQuestion(question);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new NumberRadioQuestion(question);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new NumberInputQuestion(question);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new ExpandableQuestion(question);
    if (tryValidation(concreteQuestion)) {
      return concreteQuestion;
    }

    return undefined;
  }

  static CreateFromArray(questions: IQuestion[]): ConcreteQuestion[] {
    const concreteQuestions: ConcreteQuestion[] = questions.map(question => QuestionFactory.CreateFromData(question));
    const undefinedQuestion = concreteQuestions.find(q => q === undefined);
    const allQuestionsDefined: boolean = undefinedQuestion !== undefined;

    if (!allQuestionsDefined) {
      throw new Error('an invalid question!');
    }
    return concreteQuestions;
  }
}

