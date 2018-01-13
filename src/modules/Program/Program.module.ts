import { Module } from '@nestjs/common';
import { ProgramController } from './program.controller';
import { ProgramService } from "./program.service";
import { DbElasticsearchModule } from "../db.elasticsearch/db.elasticsearch.module"

@Module({
    modules: [ DbElasticsearchModule ],
    controllers: [ProgramController],
    components: [ ProgramService ],
    exports: [ ProgramService ]
})
export class ProgramModule {}
