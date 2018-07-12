import { Component } from '@nestjs/common';
import { ConstantsReadonly } from "../constants.readonly";
import * as fs from 'fs';
import * as path from 'path';
import {ProgramDto} from "../Program/program.dto";

@Component()
export class LogService {
    LOG_PATH = process.env.NODE_ENV === 'production' ? new ConstantsReadonly().logPath : path.resolve(__dirname, 'logs');
    constructor() {
        fs.access(this.LOG_PATH, fs.constants.W_OK, err => {
            if (err) {
                console.log("CAN NOT ACCESS LOG PATH: ", this.LOG_PATH);
                throw err;
            }
        })
    }

    logFormSubmission(data: Object) {
        /*no-op*/
    }

    logProgramResults(data: ProgramDto[]) {
        /*no-op*/
    }

}