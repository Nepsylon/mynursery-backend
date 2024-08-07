import { UseInterceptors, ClassSerializerInterceptor, Body, Controller, Get, HttpException, Param, Post, UseGuards } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { createUserDto } from '../interfaces/create-user-dto.interface';

@Controller('users')
export class UserController extends MyNurseryBaseController<User> {
    constructor(service: UserService) {
        super(service);
    }

    @Post()
    create(@Body() createUserDto: createUserDto): Promise<User | HttpException> {
        return this.service.create(createUserDto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('nurseriesByOwner=:ownerId')
    async getNurseriesByOwner(@Param('ownerId') ownerId: number) {
        return (this.service as UserService).getNurseriesByOwner(ownerId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('potentialOwners')
    @UseInterceptors(ClassSerializerInterceptor)
    async getPotentialOwners() {
        return (this.service as UserService).getPotentialOwners();
    }
}
