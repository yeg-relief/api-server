import { ConcreteObject, BaseInterface } from '../types';

export interface Factory {
  createFromArray(baseInterfaceArray: BaseInterface[]): ConcreteObject[];
  createFromObject(baseInterface: BaseInterface): ConcreteObject;
}
