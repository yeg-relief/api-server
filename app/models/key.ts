import { IKey } from '../interfaces';

export class Key {
  static isKey(key: any): key is IKey {
    return /'[a-z]+_?[a-z]+?'/.test(key.name) && (key.type === 'number' || key.type === 'boolean');
  }
}