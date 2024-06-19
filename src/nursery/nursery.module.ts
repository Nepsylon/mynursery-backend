import { Module } from '@nestjs/common';
import { NurseryService } from './service/nursery.service';
import { NurseryController } from './controller/nursery.controller';

@Module({
  providers: [NurseryService],
  controllers: [NurseryController]
})
export class NurseryModule {}
