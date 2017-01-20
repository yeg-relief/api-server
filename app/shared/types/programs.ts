import { Tag, ProgramQuery } from './index';

export type UserProgram  = {
  guid: string;
  created: number;
  title: string;
  details: string;
  externalLink?: string;
  tags?: Tag[];
}

export type ApplicationProgram = {
  user: UserProgram;
  queries: ProgramQuery[];
}
