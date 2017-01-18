import { IProgram, IUserProgram, IApplicationProgram } from '../../interfaces'
import { Guid } from '../guid';

export class Program implements IProgram {
  guid: string;
  created: number;

  constructor(program: IUserProgram | IApplicationProgram) {
    this.guid = Guid.generateGuid(program.guid);
    this.created = (new Date).getTime();
  }

  static isProgram(program: any) {
    return Guid.isGuid(program.guid) && typeof program.created === 'number' && program.created > 0;
  }
}