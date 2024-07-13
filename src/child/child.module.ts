import { Module } from '@nestjs/common';
import { ChildService } from './service/child.service';
import { ChildController } from './controller/child.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';
import { Nursery } from 'src/nursery/entities/nursery.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Child, Nursery])],
    providers: [ChildService],
    controllers: [ChildController],
})
export class ChildModule {}
