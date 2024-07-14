import { Module } from '@nestjs/common';
import { ParentService } from './service/parent.service';
import { ParentController } from './controller/parent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';
import { Child } from 'src/child/entities/child.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Parent, Child])],
    providers: [ParentService],
    controllers: [ParentController],
})
export class ParentModule {}
