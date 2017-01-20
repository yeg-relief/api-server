import { IValidateable } from '../../interfaces';
import { UserProgram, ProgramQuery, ApplicationProgram } from '../../types';
import { AbstractUserProgram } from './index';

export abstract class AbstractApplicationProgram implements IValidateable  {
  applicationProgram: ApplicationProgram;
  
  protected constructor(program: any){
    this.applicationProgram = {...program};
  }

  static isApplicationFacingProgram(program: any): program is ApplicationProgram {    
    return validationFunction(program);
  }

  validate(): boolean {
    return validationFunction(this.applicationProgram);
  }
}

function validationFunction(program: ApplicationProgram): boolean {
  const user: UserProgram = {
      guid: program.user.guid,
      title: program.user.title,
      details: program.user.details,
      externalLink: program.user.externalLink,
      created: program.user.created,
      tags: program.user.tags
    }
    
    for(let i = 0; i < program.queries.length; i++) {
      if (!ProgramQuery.isProgramQuery(program.queries[i])) {
        return false;
      }
    }

    return AbstractUserProgram.isUserFacingProgram(user);
}
