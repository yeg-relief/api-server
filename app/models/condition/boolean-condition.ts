import { IBooleanCondition, ICondition } from '../../interfaces';
import { ProgramCondition } from './program-condition';

export class BooleanCondition extends ProgramCondition implements IBooleanCondition {
  value: boolean;

  constructor(condition: BooleanCondition) {
    super(condition);
    this.value = condition.value;
  }

  validate(): boolean{
    return ProgramCondition.isProgramCondition(condition) && typeof (<IBooleanCondition>condition).value === 'boolean';
  }
}