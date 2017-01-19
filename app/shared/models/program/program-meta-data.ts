import * as uuid from 'node-uuid';
import { IUserProgram } from '../../interfaces';

export class ProgramMetaData {
  static setProgramGuid(program: IUserProgram): IUserProgram {
    if (ProgramMetaData.hasValidMetaData(program)) {
      return program;
    } else if (program.guid === 'new') {
      return program.guid = uuid.v4();
    }
    program.guid = undefined;
    return program;
  }

  static setCreationDate(program: IUserProgram): IUserProgram {
    program.created = Date.now();
    return program;
  }

  static hasValidGuid(program: IUserProgram): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(program.guid)
  }

  static hasValidCreationTime(program: IUserProgram): boolean {
    const minEpochTime = 1484764677;
    return typeof program.created === 'number' && program.created > minEpochTime;
  }

  static hasValidMetaData(program: IUserProgram): boolean {
    return ProgramMetaData.hasValidGuid(program) && ProgramMetaData.hasValidCreationTime(program);
  }
}