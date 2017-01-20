import { IValidateable } from '../../interfaces';
import { NumberCondition } from '../../types';
import { isKey } from '../../validation';

export abstract class AbstractNumberCondition implements IValidateable{
  numberCondition: NumberCondition;

  protected constructor(condition: any) {
    this.numberCondition.qualifier = condition.qualifier;
    this.numberCondition.value = condition.value;
    this.numberCondition.key = (<any>Object).assign({}, condition.key);
  }

  static isNumberCondition(condition: any): condition is NumberCondition {
    return validationFunction(condition);
  }

  validate(): boolean {
    return validationFunction(this.numberCondition);
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

  return isKey(condition.key) && typeof condition.value === 'number' && validQualifier(condition.qualifier);
}