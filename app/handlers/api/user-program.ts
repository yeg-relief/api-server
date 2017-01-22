import { Client } from 'elasticsearch';
import { ProgramCache } from '../../cache';
import { RouteHandler } from '../../router';
import { KeyHandler } from '../index';

export class UserProgram {
  constructor(private programCache: ProgramCache){
    this.programCache = programCache;
  }

  getAllPrograms() {
    return (req, res, next) => {
      this.setupResponse(res);
      this.programCache.getAllSerializedPrograms()
        .take(1)
        .subscribe({
          next: (programs) => res.end(JSON.stringify({programs: programs })),
          complete: () => console.log('this is closed.')
        });
    }
  }

  private setupResponse(res) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
  }
}