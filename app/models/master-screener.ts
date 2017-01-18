import { IMasterScreener, IBooleanRadio, IExpandableQuestion, INumberInput, INumberRadio } from '../interfaces';

export class MasterScreener implements IMasterScreener {
  version: number;
  created: number;
  questions: (IBooleanRadio | IExpandableQuestion | INumberRadio | INumberInput)[];

  static isMasterScreener(masterScreener: any): masterScreener is MasterScreener {
    const screener = (<MasterScreener>masterScreener);
    if (!validCreationDate(screener.created)){
      return false;
    }



    return screener.version >= 0;
  }
}

function validCreationDate(creation: number): boolean {
  return creation > 1484764677;
}