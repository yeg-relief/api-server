import { BooleanOption, NumberOption } from './index';

export type Question = ( NumberInput | BooleanRadio | NumberRadio | ExpandableQuestion );
export type ConditionalQuestion = ( NumberInput | BooleanRadio | NumberRadio );

type id = string;

export type NumberInput = {
  id: string;
  label: string;
  key: string;
  controlType: 'NumberInput';
  value: number;
  index: number;
}

export type BooleanRadio = {
  id: string;
  label: string;
  key: string;
  controlType: 'CheckBox';
  options: BooleanOption[];
  index: number;
}

export type NumberRadio = {
  id: string;
  label: string;
  key: string;
  controlType: 'NumberSelect';
  options: NumberOption[];
  index: number;
}

export type ExpandableQuestion = {
  id: string;
  expandable: boolean;
  label: string;
  key: string;
  controlType: 'radio';
  options: BooleanOption[];
  conditonalQuestions: id[];
  index: number;
}