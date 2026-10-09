import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TestController } from './test/test/test.controller.js';
import { PrismaModule } from './lib/database/prisma.module.js';

@Module({
  controllers: [AppController, TestController],
  imports: [PrismaModule],
  providers: [AppService],
})
export class AppModule {}