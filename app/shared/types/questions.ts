import { BooleanOption, NumberOption } from './index';

export type Question = ( NumberInput | BooleanRadio | NumberRadio | ExpandableQuestion );

type id = string;

export type NumberInput = {
  id: string;
  label: string;
  key: string;
  controlType: 'NumberInput';
  value?: number;
  index: number;
}

export type BooleanRadio = {
  id: string;
  label: string;
  key: string;
  controlType: 'Toggle';
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
  controlType: 'Toggle';
  options: BooleanOption[];
  conditonalQuestions: id[];
  index: number;
}