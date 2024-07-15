import { Module } from '@nestjs/common';
import { Child } from 'src/child/entities/child.entity';
import { Activity } from 'src/activity/entities/activity.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityService } from './service/activity.service';
import { ActivityController } from './controller/activity.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Child, Activity])],
    providers: [ActivityService],
    controllers: [ActivityController],
})
export class ActivityModule {}
