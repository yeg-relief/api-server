import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ProgramModule } from "./Program"
import { QueryModule } from "./query"
import { KeyModule } from "./key"
import { NotificationModule } from "./notification";
import { ProtectedModule } from "./protected"

@Module({
  modules: [
      ProgramModule,
      QueryModule,
      KeyModule,
      NotificationModule,
      ProtectedModule
  ],
  controllers: [AppController],
  components: [],
})
export class ApplicationModule {}
