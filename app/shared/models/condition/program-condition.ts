import { ICondition, IValidateable } from '../../interfaces';
import { Key } from '../../types';
import { isKey } from '../../validation';

export class ProgramCondition implements ICondition, IValidateable {
  key: Key;

  constructor(condition: ICondition) {
    this.key.name = condition.key.name;
    this.key.type = condition.key.type;
  }

  static isProgramCondition(condition: any): condition is ProgramCondition {
    return validationFunction(condition);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(condition: ProgramCondition): boolean {
  return isKey(condition.key);
}