import { Module } from '@nestjs/common';
import { DbElasticsearchModule } from "../db.elasticsearch/db.elasticsearch.module"
import { QueryController } from "./query.controller"
import { ApplicationQueryService } from "./ApplicationQuery.service";
import { EsQueryService } from "./EsQuery.service"

@Module({
    modules: [ DbElasticsearchModule ],
    controllers: [ QueryController ],
    components: [ ApplicationQueryService, EsQueryService ],
    exports: [ ApplicationQueryService, EsQueryService, QueryController ]
})
export class QueryModule {}
