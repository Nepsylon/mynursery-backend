import { Module } from '@nestjs/common';
import { ParentService } from './service/parent.service';
import { ParentController } from './controller/parent.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parent } from './entities/parent.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Parent])],
    providers: [ParentService],
    controllers: [ParentController],
})
export class ParentModule {}
