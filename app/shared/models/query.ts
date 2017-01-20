import { IValidateable } from '../interfaces';
import { ProgramMetaData } from './program';
import { ProgramQuery } from '../types';
import { AbstractBooleanCondition, AbstractNumberCondition} from './condition';

export abstract class AbstractProgramQuery implements IValidateable {
  query: ProgramQuery;

  constructor(query: any) {
    this.query = {...query};
  }

  static isProgramQuery(query: any): query is ProgramQuery {
    return validateFunction(query);
  }

  validate(): boolean {
    return validateFunction(this.query);
  }
}

function validateFunction(query: ProgramQuery): boolean {
  const validateProperties = () => typeof query.guid === 'string' && query.guid !== 'new' && typeof query.id === 'string' 
                                          && Array.isArray(query.conditions) && query.conditions.length === 0;

  const validateConditions = () => {
    for (let i = 0; i < query.conditions.length; i++) {
      const condition = query.conditions[i];
      if (!(AbstractBooleanCondition.isBooleanCondition(condition) || AbstractNumberCondition.isNumberCondition(condition))) {
        return false;
      }
    }
    return true;
  }
  
  return validateProperties() && validateConditions();
}