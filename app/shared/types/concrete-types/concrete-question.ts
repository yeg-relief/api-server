import { NumberInputQuestion, NumberRadioQuestion, BooleanRadioQuestion, ExpandableQuestion } from '../../models';

export type ConcreteQuestion = ( ConcreteNumberQuestion | ConcreteBooleanQuestion );

export type ConcreteNumberQuestion = ( NumberRadioQuestion | NumberInputQuestion );

export type ConcreteBooleanQuestion = ( BooleanRadioQuestion | ExpandableQuestion );