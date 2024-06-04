import { Module } from '@nestjs/common';
import { ChildService } from './service/child.service';
import { ChildController } from './controller/child.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './entities/child.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Child])],
    providers: [ChildService],
    controllers: [ChildController],
})
export class ChildModule {}
