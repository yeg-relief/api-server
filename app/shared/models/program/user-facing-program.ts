import { IUserProgram } from '../../interfaces';
import { ProgramMetaData } from './index';
import { Tag } from '../../types';

export class UserProgram implements IUserProgram {
  title: string;
  details: string;
  externalLink: string;
  tags: Tag[];
  guid: string;
  created: number;

  constructor(program: IUserProgram) {
    this.guid = program.guid;
    this.created = program.created;
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
  return typeof program.title === 'string' && typeof program.details === 'string' && ProgramMetaData.hasValidMetaData(program);
}