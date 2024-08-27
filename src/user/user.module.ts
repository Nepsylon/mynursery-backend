import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controller/user.controller';
import { UserService } from './service/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MailModule } from 'src/mail/mail.module';
import { Nursery } from 'src/nursery/entities/nursery.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Nursery]), forwardRef(() => MailModule)],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
