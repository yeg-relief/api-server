import { IApplicationProgram, IUserProgram, IProgramQuery } from '../../interfaces';
import { UserProgram } from './user-facing-program';
import { Guid } from '../guid';
import { Program } from './program';

export class ApplicationProgram extends UserProgram implements IApplicationProgram  {
  guid: string;
  queries: IProgramQuery[];
  user: IUserProgram;
  
  constructor(program: IApplicationProgram){
    super(program);
  }

  static isApplicationFacingProgram(program: any): program is ApplicationProgram {    
    const user: IUserProgram = {
      guid: program.guid,
      title: program.title,
      details: program.details,
      externalLink: program.externalLink,
      created: program.created,
      tags: [...program.tags]
    }
    
    const application: IApplicationProgram = (<any>Object).assign({}, user,  {
      queries: [...program.queries]
    });

    const guid = (<IApplicationProgram>program).guid;

    return UserProgram.isUserFacingProgram(user) && Program.isProgram(program);
  }
}
