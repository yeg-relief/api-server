import { IUserProgram } from '../../interfaces';
import { Guid } from '../guid';
import { Program } from './program';
import { Tag } from '../../types';

export class UserProgram extends Program implements IUserProgram {
  title: string;
  details: string;
  externalLink: string;
  tags: Tag[];

  constructor(program: IUserProgram) {
    super(program);
    this.title = program.title;
    this.details = program.details;
    this.externalLink = program.externalLink;
    this.tags = program.tags;
  }

  static isUserFacingProgram(program: any): program is UserProgram {
    return validationFunction(program);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(program: IUserProgram): boolean {
  return typeof program.title === 'string' && typeof program.details === 'string' && Program.isProgram(program);
}