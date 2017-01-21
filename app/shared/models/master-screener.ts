import { IValidateable } from '../interfaces';
import { MasterScreener } from '../types';
import { AbstractBooleanRadio, AbstractExpandableQuestion, AbstractNumberInput, AbstractNumberRadio } from './question';

export class AbstractMasterScreener implements IValidateable {
  screener: MasterScreener


  constructor(screener: any) {
    this.screener = {...screener};
  }


  static isMasterScreener(masterScreener: any): masterScreener is MasterScreener {
    return validateFunction(masterScreener);
  }

  validate(): boolean {
    return validateFunction(this.screener);
  }

}

function validCreationDate(creation: number): boolean {
  // can't go back in time and create a question before I write the program...
  const minEpochTime: number = 1484764677;
  return typeof creation === 'number' && creation > minEpochTime;
}

// target for refactoring
function validateFunction(screener: MasterScreener): boolean {
  if (!validCreationDate(screener.created) || !(typeof screener.version === 'number' && screener.version >= 0)) {
    return false;
  }
  for (let i = 0; i < screener.questions.length; i++) {
    const question = screener.questions[i];

    if ( question instanceof AbstractNumberRadio ) {
      if (!question.validate()){
        return false;
      }
    }

    if ( question instanceof AbstractNumberInput ) {
      if (!question.validate()) {
        return false;
      }
    }
    
    if ( question instanceof AbstractBooleanRadio ) {
      if (!question.validate()) {
        return false;
      }
    }

    if ( question instanceof AbstractExpandableQuestion ) {
      if (!question.validate()) {
        return false;
      }
    }
  }

  return true;
}