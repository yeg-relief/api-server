import { BooleanCondition, NumberCondition } from '../models';
import { Factory } from '../interfaces';
import { tryValidation } from '../validation';
import { ConcreteCondition, BaseInterface } from '../types';

export class ConditionFactory implements Factory {
  createFromObject(baseInterface: BaseInterface): ConcreteCondition {
    let concreteCondition: ConcreteCondition;
    
    concreteCondition = new BooleanCondition(<BooleanCondition>baseInterface);
    if (tryValidation(concreteCondition)){
      return concreteCondition;
    }

    concreteCondition = new NumberCondition(<NumberCondition>baseInterface);
    if (tryValidation(concreteCondition)){
      return concreteCondition;
    }

    return undefined;
  }

  createFromArray(baseInterfaceArray: BaseInterface[]): ConcreteCondition[] {
    const concreteConditions: ConcreteCondition[] = baseInterfaceArray.map(cond => this.createFromObject(cond));
    const undefinedCondition = concreteConditions.find(cond => cond === undefined);
    const allConditionsDefined: boolean = undefinedCondition !== undefined;
    
    if (!allConditionsDefined) {
      throw new Error('an invalid condition!');
    }
    return concreteConditions;
  }
}

