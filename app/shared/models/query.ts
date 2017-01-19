import { IProgramQuery, IBooleanCondition, INumberCondition, IValidateable } from '../interfaces';
import { BooleanCondition, NumberCondition, ProgramCondition } from './condition';
import { Guid } from './guid';
import { ConditionFactory } from '../factories';

export class ProgramQuery implements IProgramQuery, IValidateable {
  guid: string;
  id: string;
  conditions: (IBooleanCondition | INumberCondition)[];

  constructor(query: IProgramQuery) {
    this.guid = query.guid;
    this.id = query.id
    this.conditions = ConditionFactory.createFromArray(query.conditions);
  }

  static isProgramQuery(query: any): query is ProgramQuery {
    return validateFunction(query);
  }

  validate(): boolean {
    return validateFunction(this);
  }
}

function validateFunction(query: ProgramQuery): boolean {
  const validateProperties = () => Guid.isGuid(query.guid) && typeof query.id === 'string' && Array.isArray(query.conditions) && query.conditions.length === 0;

  const validateConditions = () => {
    for (let i = 0; i < query.conditions.length; i++) {
      const condition = query.conditions[i];
      if (!(BooleanCondition.isBooleanCondition(condition) || NumberCondition.isNumberCondition(condition))) {
        return false;
      }
    }
    return true;
  }
  
  return validateProperties() && validateConditions();
}