import { INumberCondition } from '../../interfaces';
import { ProgramCondition } from './program-condition';

export class NumberCondition extends ProgramCondition implements INumberCondition {
  value: number;
  qualifier: 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';

  constructor(condition: INumberCondition) {
    super(condition);
    this.value = condition.value;
  }

  static isNumberCondition(condition: any): condition is NumberCondition {
    return validationFunction(condition);
  }

  validate(): boolean {
    return validationFunction(this);
  }
}

function validationFunction(condition: NumberCondition): boolean {
  const validQualifier = (qualifier: string): boolean => {
    
    const validQualifiers: string[] = ['lessThan', 'lessThanOrEqual', 'equal', 'greaterThanOrEqual', 'greaterThan'];
    
    if(typeof qualifier !== 'string'){
      return false;
    }
    
    let validQualifier: boolean = false;
    validQualifiers.forEach(q => {
      if (q === qualifier) {
        validQualifier = true;
      }
    })

    return validQualifier;
  }

  return ProgramCondition.isProgramCondition(condition) && typeof condition.value === 'number' && validQualifier(condition.qualifier);
}