import { INumberOption, IBooleanOption } from '../../interfaces';
import { QuestionOption } from './question-option';

export class NumberOption extends QuestionOption implements INumberOption {
  display: string;
  value: number;

  constructor(option: INumberOption) {
    super(option);
    this.value = option.value;
  }

  static create(option: INumberOption): NumberOption {
    const newOption = new NumberOption(option);
    if(!newOption.validate()) {
      throw new Error('invalid number option');
    }
    return newOption
  }

  static createFromArray(options: INumberOption[]): NumberOption[] {
    const newOptions = [];
    for(let i = 0; i < options.length; i++){
      newOptions[i] = NumberOption.create(options[i]);
    }
    return newOptions;
  }

  validate(): boolean {
    return this.validQuestion() && this.value >= 0;
  }
}