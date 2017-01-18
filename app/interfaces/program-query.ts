import { IBooleanCondition, INumberCondition } from './program-condition';

export interface IProgramQuery {
  guid: string; // guid is the program guid -- used to associate query <==> program
  id: string; // id is for client side editing etc
  conditions: (IBooleanCondition | INumberCondition)[];
}
