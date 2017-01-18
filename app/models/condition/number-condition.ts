import { INumberCondition } from '../../interfaces';
import { ProgramCondition } from './program-condition';

export class NumberCondition extends ProgramCondition implements INumberCondition {
  value: number;
  qualifier: 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';

  constructor(condition: INumberCondition) {
    super(condition);
    this.value = condition.value;
  }

  static validateQualifier(qualifier: string): boolean {
    const validQualifiers: string[] = ['lessThan', 'lessThanOrEqual', 'equal', 'greaterThanOrEqual', 'greaterThan'];
    const isString: boolean = typeof qualifier === 'string';
    let validQualifier: boolean = false;
    validQualifiers.forEach(q => {
      if (q === qualifier){
        validQualifier = true;
      }
    })

    return isString && validQualifier;
  }

  static isNumberCondition(condition: any): condition is NumberCondition {
    return ProgramCondition.isProgramCondition(condition) 
           && typeof (<NumberCondition>condition).value === 'number' 
           && NumberCondition.validateQualifier((<NumberCondition>condition).qualifier);
  }
}