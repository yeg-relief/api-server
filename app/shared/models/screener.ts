import { IValidateable } from '../interfaces';
import { Screener } from '../types';
import { AbstractBooleanRadio, AbstractExpandableQuestion, AbstractNumberInput, AbstractNumberRadio } from './question';

export class AbstractScreener implements IValidateable {
  screener: Screener


  constructor(screener: any) {
    this.screener = {...screener};
  }


  static isScreener(screener: any): screener is Screener {
    return validateFunction(screener);
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
function validateFunction(screener: Screener): boolean {
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