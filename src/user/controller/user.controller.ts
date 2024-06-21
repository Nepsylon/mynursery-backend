import { Body, Controller, Get, HttpException, Param, Post, UseGuards } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { createUserDto } from '../interfaces/create-user-dto.interface';

@Controller('users')
export class UserController extends MyNurseryBaseController<User> {
    constructor(service: UserService) {
        super(service);
    }

    //@UseGuards(AuthGuard)
    @Post()
    //@Roles(Role.Admin)
    create(@Body() createUserDto: createUserDto): Promise<User | HttpException> {
        return this.service.create(createUserDto);
    }
}
