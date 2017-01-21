import { Key } from '../types';

export function isKey(key: any): key is Key {
  const twoProps: boolean = Object.keys(key).length === 2;
  // determine proper regex for key name /'[a-z]+_?[a-z]+?'/.test(key.name) throws unecessary false

  return typeof key.name === 'string' && key.name.length > 0 && key.name !== 'percolator' && key.name !== 'meta' && key.name !== 'query'
         && (key.type === 'integer' || key.type === 'boolean') && twoProps;
}