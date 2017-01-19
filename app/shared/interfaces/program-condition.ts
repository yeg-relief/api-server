import { IKey } from './key';

export interface ICondition {
  key: IKey;
}

export interface IBooleanCondition extends ICondition {
  value: boolean;
}

export interface INumberCondition extends ICondition {
  value: number;
  qualifier: 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';
}