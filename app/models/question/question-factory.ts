import { 
  Question, BooleanRadioQuestion, 
  NumberInputQuestion, NumberRadioQuestion,
  ExpandableQuestion 
} from './index';

import { IQuestion, ConcreteQuestion } from '../../interfaces';

export class QuestionFactory {
  static createFromData(question: IQuestion): ConcreteQuestion {
    let concreteQuestion;
    concreteQuestion = new BooleanRadioQuestion(question);
    if (validateFn(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new NumberRadioQuestion(question);
    if (validateFn(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new NumberInputQuestion(question);
    if (validateFn(concreteQuestion)) {
      return concreteQuestion;
    }

    concreteQuestion = new ExpandableQuestion(question);
    if (validateFn(concreteQuestion)) {
      return concreteQuestion;
    }

    return undefined;
  }

  static createFromArray(questions: IQuestion[]): ConcreteQuestion[] {
    const concreteQuestions: ConcreteQuestion[] = questions.map(q => QuestionFactory.createFromData(q));
    const undef = concreteQuestions.find(q => q === undefined);
    if (undef !== undefined) {
      throw new Error('an invalid question!');
    }
    return concreteQuestions;
  }
}

export function validateFn(question: ConcreteQuestion): boolean {
  try {
    if (question.validate()) {
      return true;
    }
  } catch (error) {
    console.error(error)
  }
  return false;
}