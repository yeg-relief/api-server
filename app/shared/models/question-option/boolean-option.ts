import { IValidateable } from '../../interfaces';
import { BooleanOption } from '../../types';

export abstract class AbstractBooleanOption implements IValidateable {
  booleanOption: BooleanOption;

  constructor(option: any) {
    this.booleanOption = {...option};
  }

  static isBooleanOption(option: any): option is BooleanOption {
    return validationFunction(option);
  }

  validate(): boolean {
    return validationFunction(this.booleanOption);
  }
}

function validationFunction(option: BooleanOption): boolean {
  return typeof option.value === 'boolean' && typeof option.display === 'string' && option.display.length > 0;
}