import { ConcreteObject } from '../types';
import { IQuestion, IQuestionOption, IProgram, ICondition } from './index';

export type BaseInterface = (IQuestion | IQuestionOption | IProgram | ICondition);

export interface Factory {
  CreateFromData(baseInterface: BaseInterface): ConcreteObject;
  CreateFromArray(baseInterfaceArray: BaseInterface[]): ConcreteObject[];
}