import { IMasterScreener, IValidateable } from '../interfaces';
import { QuestionFactory } from '../factories';
import { InterfaceQuestion, ConcreteQuestion } from '../types';

export class MasterScreener implements IMasterScreener, IValidateable {
  version: number;
  created: number;
  questions: InterfaceQuestion[];


  constructor(screener: IMasterScreener) {
    this.version = screener.version;
    this.created = screener.created;
    this.questions = QuestionFactory.createFromArray(screener.questions);
    
  }


  static isMasterScreener(masterScreener: any): masterScreener is MasterScreener {
    return validateFunction(masterScreener);
  }

  validate(): boolean {
    return validateFunction(this);
  }
}

function validCreationDate(creation: number): boolean {
  // can't go back in time and create a question before I write the program...
  const minEpochTime: number = 1484764677;
  return typeof creation === 'number' && creation > minEpochTime;
}

function validateFunction(screener: MasterScreener): boolean {
  if (!validCreationDate(screener.created)) {
    return false;
  }
  for (let i = 0; i < screener.questions.length; i++) {
    const concreteQuestion = <ConcreteQuestion>screener[i];
    if (!concreteQuestion.validate()) {
      return false;
    }
  }

  return typeof screener.version === 'number' && screener.version >= 0;
}