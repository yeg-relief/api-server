import { IProgramQuery, IBooleanCondition, INumberCondition } from '../interfaces';
import { BooleanCondition, NumberCondition, ProgramCondition } from './condition';
import { Guid } from './guid';

/*
need to handle id somehow someway
https://github.com/yeg-relief/api-server/blob/55cfabf5eccde671b7774b094fec4ffb7ea8f42c/app/es/percolator/init-percolator.js#L132-L137
*/

export class ProgramQuery implements IProgramQuery {
  guid: string; 
  id: string; 
  conditions: (IBooleanCondition | INumberCondition)[];

  constructor(query: IProgramQuery){
    this.guid = query.guid;
    this.id = query.id
    this.conditions = [...query.conditions];
  }

  static isProgramQuery(query: any): query is ProgramQuery {
    const programQuery = (<ProgramQuery>query);
    for(const untestedQuery in programQuery.conditions){
      if (!ProgramCondition.isProgramCondition(untestedQuery) 
      && (!BooleanCondition.isBooleanCondition(programQuery) || !NumberCondition.isNumberCondition(programQuery) )){
        return false;
      }
    }
    return Guid.isGuid(programQuery.guid) && typeof programQuery.id === 'string';
  }
}