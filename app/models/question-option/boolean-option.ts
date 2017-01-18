import { IBooleanOption } from '../../interfaces';
import { QuestionOption } from './question-option';

export class BooleanOption extends QuestionOption implements IBooleanOption {
  display: string;
  value: boolean;

  constructor(option: IBooleanOption) {
    super(option);
    this.value = option.value;
  }

  static create(option: IBooleanOption): BooleanOption {
    const newOption = new BooleanOption(option);
    if(!newOption.validate()) {
      throw new Error('invalid number option');
    }
    return newOption
  }

  static createFromArray(options: IBooleanOption[]): BooleanOption[] {
    const newOptions = [];
    for(let i = 0; i < options.length; i++){
      newOptions[i] = BooleanOption.create(options[i]);
    }
    return newOptions;
  }

  validate(): boolean {
    return this.validQuestion && typeof this.value === 'boolean'
  }
}