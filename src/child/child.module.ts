import { Module } from '@nestjs/common';
import { ChildService } from './service/child.service';
import { ChildController } from './controller/child.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';
import { Nursery } from 'src/nursery/entities/nursery.entity';
import { Parent } from 'src/parent/entities/parent.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Child, Nursery, Parent])],
    providers: [ChildService],
    controllers: [ChildController],
})
export class ChildModule {}
