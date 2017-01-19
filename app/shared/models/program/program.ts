import { IProgram, IUserProgram, IApplicationProgram, IValidateable } from '../../interfaces'
import { Guid } from '../guid';

export class Program implements IProgram, IValidateable {
  guid: string;
  created: number;

  protected constructor(program: IUserProgram | IApplicationProgram) {
    this.guid = program.guid;
    this.created = program.created;
  }

  static isProgram(program: any): program is Program {
    return validationFunction(program);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(program: IProgram): boolean{
  // can't go back in time and create a question before I write the program...
  const minEpochTime: number = 1484764677;
  return Guid.isGuid(program.guid) && typeof program.created === 'number' && program.created > 1484764677;
}