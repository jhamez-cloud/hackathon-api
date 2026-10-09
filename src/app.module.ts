import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TestController } from './test/test/test.controller.js';

@Module({
  controllers: [AppController, TestController],
  providers: [AppService],
})
export class AppModule {}