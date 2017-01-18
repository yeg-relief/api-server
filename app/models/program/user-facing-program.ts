import { IUserProgram, Tag } from '../../interfaces';
import { Guid } from '../guid';
import { Program } from './program';

export class UserProgram extends Program implements IUserProgram {
  title: string;
  details: string;
  externalLink: string;
  tags: Tag[];

  // this constructor is only called from ApplicationProgram... is there a better structure?
  constructor(program: IUserProgram) {
    super(program);
    this.title = program.title;
    this.details = program.details;
    this.externalLink = program.externalLink;
    this.tags = [...program.tags];
  }

  static isUserFacingProgram(program: any): program is UserProgram {
    const title = (<IUserProgram>program).title;
    const details = (<IUserProgram>program).details;
    return typeof title === 'string' && typeof details === 'string';
  }

}

export class InvalidUserProgram extends Error {
  constructor(message: string) {
    super();
    this.name = 'InvalidUserProgram';
    this.message = message;
    this.stack = (<any>new Error()).stack;
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}