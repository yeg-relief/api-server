import { IQuestionOption, INumberOption, IBooleanOption } from './question-option';
import { NumberRadioQuestion,  NumberInputQuestion, BooleanRadioQuestion, ExpandableQuestion } from '../models';
import { ConcreteQuestion } from '../types';

export interface IQuestion {
  label: string;
  key: string;
}

export interface IInputQuestion extends IQuestion {
  controlType: 'input';
}

export interface INumberInput extends IInputQuestion {
  value: number;
}

export interface IRadioQuestion extends IQuestion {
  controlType: 'radio';
}

export interface IBooleanRadio extends IRadioQuestion {
  options: IBooleanOption[];
}

export interface INumberRadio extends IRadioQuestion {
  options: INumberOption[];
}

export interface IExpandableQuestion extends IBooleanRadio {
  expandable: boolean;
  conditonalQuestions: ConcreteQuestion[];
}