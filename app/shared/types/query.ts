import { BooleanCondition, NumberCondition } from './index';

export interface ProgramQuery {
  guid: string; // guid is the program guid -- used to associate query <==> program
  id: string; // id is for client side editing etc
  conditions: (BooleanCondition | NumberCondition)[];
}
