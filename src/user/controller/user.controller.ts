import { Controller } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';

@Controller('user')
export class UserController extends MyNurseryBaseController<User> {
    constructor(service: UserService) {
        super(service);
    }
}
