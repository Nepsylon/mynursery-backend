import { Module } from '@nestjs/common';
import { ChildService } from './child/child.service';
import { ChildController } from './child/child.controller';

@Module({
    providers: [ChildService],
    controllers: [ChildController],
})
export class ChildModule {}
