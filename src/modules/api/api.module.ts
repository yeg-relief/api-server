import { Module } from '@nestjs/common';
import { ProgramModule } from '../Program'
import { QueryModule } from "../query";
import { ApiController } from "./api.controller";
import { KeyModule } from "../key";


@Module({
    modules: [
        ProgramModule,
        QueryModule,
        KeyModule
    ],
    controllers: [ ApiController ],
    components: [ ApiController ],
    exports: [ ]
})
export class ApiModule {}
