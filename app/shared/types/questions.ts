
export type Question = ( NumberInput | BooleanRadio | NumberRadio | ExpandableQuestion );

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
  conditonalQuestions: Question[];
}