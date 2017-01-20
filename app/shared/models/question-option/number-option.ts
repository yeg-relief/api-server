import { IValidateable } from '../../interfaces';
import { NumberOption } from '../../types';

export abstract class AbstractNumberOption implements IValidateable {
  numberOption: NumberOption;

  protected constructor(option: any) {
    this.numberOption = {...option};
  }

  static isNumberOption(option: any): option is NumberOption {
    return validationFunction(option);
  }

  validate(): boolean {
    return validationFunction(this.numberOption);
  }
}

function validationFunction(option: NumberOption): boolean {
  return typeof option.value === 'number' && option.value >= 0 && typeof option.display === 'string' && option.display.length > 0;
}