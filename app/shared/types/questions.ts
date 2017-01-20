import { BooleanOption, NumberOption } from './index';
import { AbstractNumberInput, AbstractNumberRadio, AbstractBooleanRadio } from '../models';

export type Question = ( NumberInput | BooleanRadio | NumberRadio | ExpandableQuestion );
export type ConditionalQuestion = ( NumberInput | BooleanRadio | NumberRadio );


export type NumberInput = {
  label: string;
  key: string;
  controlType: 'input';
  value: number;
}

export type BooleanRadio = {
  label: string;
  key: string;
  controlType: 'radio';
  options: BooleanOption[];
}

export type NumberRadio = {
  label: string;
  key: string;
  controlType: 'radio';
  options: NumberOption[];
}

export type ExpandableQuestion = {
  expandable: boolean;
  label: string;
  key: string;
  controlType: 'radio';
  options: BooleanOption[];
  conditonalQuestions: ConditionalQuestion[];
}