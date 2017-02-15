import { IValidateable } from '../../interfaces';
import { BooleanCondition } from '../../types';
import { isKey } from '../../validation';

export abstract class AbstractBooleanCondition implements IValidateable {
  booleanCondition: BooleanCondition;

  protected constructor(condition: any) {
    this.booleanCondition.key = {...condition.key};
    this.booleanCondition.value = condition.value;
  }

  static isBooleanCondition(condition: any): condition is BooleanCondition {
    return validationFunction(condition);
  }

  validate(): boolean{
    return validationFunction(this.booleanCondition);
  }
}

function validationFunction(condition: BooleanCondition): boolean {
  return isKey(condition.key) && typeof condition.value === 'boolean';
}