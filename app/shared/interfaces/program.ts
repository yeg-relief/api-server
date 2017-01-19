import { IProgramQuery, IValidateable } from './index';
import { Tag } from '../types';

export interface IUserProgram {
  guid: string;
  created: number;
  title: string;
  details: string;
  externalLink?: string;
  tags?: Tag[];
}

export interface IApplicationProgram extends IUserProgram {
  queries: IProgramQuery[];
}
