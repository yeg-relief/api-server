import { BooleanOption, NumberOption } from '../models';
import { Factory } from '../interfaces';
import { ConcreteOption, BaseInterface } from '../types';
import { tryValidation } from '../validation';


export class OptionFactory implements Factory {
  createFromObject(baseInterface: BaseInterface): ConcreteOption {
    let concreteOption: ConcreteOption;

    concreteOption = new BooleanOption(<BooleanOption>baseInterface);
    if (tryValidation(concreteOption)) {
      return concreteOption;
    }

    concreteOption = new NumberOption(<NumberOption>baseInterface);
    if (tryValidation(concreteOption)) {
      return concreteOption;
    }

    return undefined;
  }
  createFromArray(baseInterfaceArray: BaseInterface[]): ConcreteOption[] {
    const concreteQuestions: ConcreteOption[] = baseInterfaceArray.map(question => this.createFromObject(question));
    const undefinedQuestion = concreteQuestions.find(q => q === undefined);
    const allQuestionsDefined: boolean = undefinedQuestion !== undefined;

    if (!allQuestionsDefined) {
      throw new Error('an invalid question!');
    }
    return concreteQuestions;
  }

}