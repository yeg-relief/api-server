import { IBooleanCondition } from '../../interfaces';
import { ProgramCondition } from './program-condition';

export class BooleanCondition extends ProgramCondition implements IBooleanCondition {
  value: boolean;

  constructor(condition: BooleanCondition) {
    super(condition);
    this.value = condition.value;
  }

  static isBooleanCondition(condition: any): condition is BooleanCondition {
    return ProgramCondition.isProgramCondition(condition) && typeof (<IBooleanCondition>condition).value === 'boolean';
  }
}