import { ICondition, IKey, IValidateable } from '../../interfaces';
import { Key } from '../key';

export class ProgramCondition implements ICondition, IValidateable {
  key: IKey;

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
  return Key.isKey(condition.key);
}