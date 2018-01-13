import { Module } from '@nestjs/common';
import { DbElasticsearchModule } from "../db.elasticsearch/db.elasticsearch.module"
import { KeyService } from "./key.service"
import { KeyController } from "./key.controller"

@Module({
    modules: [ DbElasticsearchModule ],
    controllers: [ KeyController ],
    components: [ KeyService ],
    exports: [ KeyService ]
})
export class KeyModule {}
