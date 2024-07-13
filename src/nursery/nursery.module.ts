import { Module } from '@nestjs/common';
import { NurseryService } from './service/nursery.service';
import { NurseryController } from './controller/nursery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nursery } from './entities/nursery.entity';
import { User } from 'src/user/entities/user.entity';
import { Child } from 'src/child/entities/child.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Nursery, User, Child])],
    providers: [NurseryService],
    controllers: [NurseryController],
})
export class NurseryModule {}
