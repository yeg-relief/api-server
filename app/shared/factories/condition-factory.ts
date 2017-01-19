import { BooleanCondition, NumberCondition, ProgramCondition } from '../models';
import { ICondition, Factory, BaseInterface } from '../interfaces';
import { tryValidation } from '../validation';
import { ConcreteCondition, ConcreteObject } from '../types';

export class ConditionFactory implements Factory {
  CreateFromData(baseInterface: BaseInterface): ConcreteObject {
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

  CreateFromArray(baseInterfaceArray: BaseInterface[]): ConcreteObject[] {
    const concreteConditions: ConcreteObject[] = baseInterfaceArray.map(cond => this.CreateFromData(cond));
    const undefinedCondition = concreteConditions.find(cond => cond === undefined);
    const allConditionsDefined: boolean = undefinedCondition !== undefined;
    
    if (!allConditionsDefined) {
      throw new Error('an invalid condition!');
    }
    return concreteConditions;
  }
}

