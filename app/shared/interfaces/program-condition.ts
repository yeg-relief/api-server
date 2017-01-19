import { IValidateable } from './index';
import { Key } from '../types';
export interface ICondition extends IValidateable {
  key: Key;
}

export interface IBooleanCondition extends ICondition {
  value: boolean;
}

export interface INumberCondition extends ICondition {
  value: number;
  qualifier: 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';
}