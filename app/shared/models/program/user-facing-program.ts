import { IValidateable } from '../../interfaces';
import { ProgramMetaData } from './index';
import { Tag, UserProgram } from '../../types';

export abstract class AbstractUserProgram implements IValidateable {
  protected userProgram: UserProgram;

  constructor(program: any) {
    this.userProgram = {...program};
  }

  static isUserFacingProgram(program: any): program is UserProgram {
    return validationFunction(program);
  }

  validate(): boolean {
    return validationFunction(this.userProgram);
  }
}

function validationFunction(program: UserProgram): boolean {
  return typeof program.title === 'string' && typeof program.details === 'string' && ProgramMetaData.hasValidMetaData(program);
}