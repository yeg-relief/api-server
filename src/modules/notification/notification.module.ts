import { Module } from '@nestjs/common';
import { DbElasticsearchModule } from "../db.elasticsearch/db.elasticsearch.module";
import { NotificationController } from "./notification.controller"
import { NotificationService } from "./notification.service";
import { ProgramModule } from "../Program/Program.module";

@Module({
    modules: [ DbElasticsearchModule, ProgramModule ],
    controllers: [ NotificationController ],
    components: [ NotificationService ],
})
export class NotificationModule {}
