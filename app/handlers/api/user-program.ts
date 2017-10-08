import { ProgramCache } from '../../cache';
import { KeyHandler } from '../index';

export class UserProgram {
    constructor(private programCache: ProgramCache){
        this.programCache = programCache;
    }

    getProgram() {

        return (req, res) => {
            this.setupResponse(res);
            const guid = req.params.guid;
            this.programCache.getAllSerializedPrograms()
                .take(1)
                .map(programs => programs.filter(p => p.guid === guid))
                .map(program => program[0] ? program[0] : {})
                .subscribe({
                    next: program => res.end(JSON.stringify({ data: program })),
                    error: error => KeyHandler.handleError(res, error)
                });
        }
    }


    getAllPrograms() {

        return (req, res) => {
            this.setupResponse(res);
            this.programCache.getAllSerializedPrograms()
                .take(1)
                .subscribe({
                    next: (programs) => res.end(JSON.stringify({programs: programs })),
                    error: error => KeyHandler.handleError(res, error)
                });
        }
    }

    private setupResponse(res) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
    }
}