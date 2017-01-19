import { BooleanCondition, NumberCondition } from '../../models';
export type ConcreteCondition = (BooleanCondition | NumberCondition);