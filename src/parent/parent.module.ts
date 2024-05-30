import { Module } from '@nestjs/common';
import { ParentService } from './service/parent.service';
import { ParentController } from './parent/parent.controller';

@Module({
    providers: [ParentService],
    controllers: [ParentController],
})
export class ParentModule {}
