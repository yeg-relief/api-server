import { IApplicationProgram, IUserProgram, IProgramQuery } from '../../interfaces';
import { UserProgram } from './user-facing-program';

export class ApplicationProgram extends UserProgram implements IApplicationProgram  {
  queries: IProgramQuery[];
  
  constructor(program: IApplicationProgram){
    super(program);
  }

  static isApplicationFacingProgram(program: any): program is ApplicationProgram {    
    return validationFunction(program);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(program: IApplicationProgram): boolean {
  const user: IUserProgram = {
      guid: program.guid,
      title: program.title,
      details: program.details,
      externalLink: program.externalLink,
      created: program.created,
      tags: program.tags
    }
    
    const application: IApplicationProgram = (<any>Object).assign({}, user,  {
      queries: [...program.queries]
    });

    return UserProgram.isUserFacingProgram(user);
}
