import { 
  IMasterScreener, IBooleanRadio, 
  IExpandableQuestion, INumberInput, 
  INumberRadio, InterfaceQuestion,
  ConcreteQuestion 
} from '../interfaces';
import { QuestionFactory } from './question';

export class MasterScreener implements IMasterScreener {
  version: number;
  created: number;
  questions: InterfaceQuestion[];


  constructor(screener: IMasterScreener){
    this.version = screener.version;
    this.created = screener.created;
    this.questions = QuestionFactory.createFromArray(screener.questions);
  }


  static isMasterScreener(masterScreener: IMasterScreener): masterScreener is MasterScreener {
    if (!validCreationDate(masterScreener.created)){
      return false;
    }
    for(let i = 0; i < masterScreener.questions.length; i++) {
      const concreteQuestion = <ConcreteQuestion>masterScreener[i];
      if(!concreteQuestion.validate()){
        return false;
      }
    }

    return typeof masterScreener.version === 'number' && masterScreener.version >= 0;
  }
}

function validCreationDate(creation: number): boolean {
  // can't go back in time and create a question before I write the program...

  const minEpochTime: number = 1484764677;
  return typeof creation === 'number' && creation > minEpochTime;
}