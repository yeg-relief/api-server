import { IProgramQuery } from './program-query';

export type Tag = string;

export interface IProgram {
  guid: string;
  created: number;
}

export interface IUserProgram extends IProgram{
  title: string;
  details: string;
  externalLink?: string;
  tags?: Tag[];
}

export interface IApplicationProgram extends IUserProgram{
  queries: IProgramQuery[];
}
