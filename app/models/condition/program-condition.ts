import { ICondition, IKey } from '../../interfaces';
import { Key } from '../key';

export class ProgramCondition implements ICondition {
  key: IKey;

  constructor(condition: ICondition) {
    this.key.name = condition.key.name;
    this.key.type = condition.key.type;
  }

  static isProgramCondition(condition: any): condition is ProgramCondition {
    return Key.isKey(condition.key);
  }
}