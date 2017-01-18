import * as guid from 'node-uuid';

export class Guid {

  static generateGuid(guid): string{
    if (Guid.isGuid(guid) && guid !== 'new') {
      return guid;
    } else if (guid === 'new') {
      return guid.v4();
    }
    else {
      throw new InvalidGuid(guid);
    }
  }
  
  static isGuid(guid: any) {
    return typeof guid === 'string';
  }


}

export class InvalidGuid extends Error {
  constructor(message: string) {
    super();
    this.name = 'InvalidGuid';
    this.message = message;
    this.stack = (<any>new Error()).stack;
  }

  toString() {
    return this.name + ': ' + this.message;
  }
}