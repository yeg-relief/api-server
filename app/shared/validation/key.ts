import { Key } from '../types';

export function isKey(key: any): key is Key {
  const twoProps: boolean = Object.keys(key).length === 2;
  return /'[a-z]+_?[a-z]+?'/.test(key.name) && (key.type === 'number' || key.type === 'boolean') && twoProps;
}