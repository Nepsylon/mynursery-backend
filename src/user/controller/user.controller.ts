import { Controller } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { User } from '../entities/user.entity';

@Controller('user')
export class UserController extends MyNurseryBaseController<User> {}
