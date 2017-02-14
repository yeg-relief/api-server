import * as uuid from 'node-uuid';
import { UserProgram } from '../../types';

export class ProgramMetaData {
  static setProgramGuid(program: UserProgram): UserProgram {
    if (ProgramMetaData.hasValidMetaData(program)) {
      return program;
    } else if (program.guid === 'new') {
      return program.guid = uuid.v4();
    }
    program.guid = undefined;
    return program;
  }

  static setCreationDate(program: UserProgram): UserProgram {
    program.created = Date.now();
    return program;
  }

  static hasValidGuid(program: UserProgram): boolean {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(program.guid) && program.guid !== 'new';
  }

  static hasValidCreationTime(program: UserProgram): boolean {
    const minEpochTime = 1484764677;
    return typeof program.created === 'number' && program.created > minEpochTime;
  }

  static hasValidMetaData(program: UserProgram): boolean {
    return ProgramMetaData.hasValidGuid(program) && ProgramMetaData.hasValidCreationTime(program);
  }
}