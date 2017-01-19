import { Key } from './key';

export type NumberCondition = {
  value: number;
  qualifier: 'lessThan' | 'lessThanOrEqual' | 'equal' | 'greaterThanOrEqual' | 'greaterThan';
}

export type BooleanCondition = {
  key: Key;
  value: boolean;
}

export type Condition = (BooleanCondition | NumberCondition);