import {
    UseInterceptors,
    ClassSerializerInterceptor,
    Body,
    Controller,
    Get,
    HttpException,
    Param,
    Post,
    UseGuards,
    Query,
} from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { User } from '../entities/user.entity';
import { UserService } from '../service/user.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { createUserDto } from '../interfaces/create-user-dto.interface';
import { PaginatedItems } from 'src/shared/interfaces/paginatedItems.interface';

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
    @Get('potentialOwners')
    @UseInterceptors(ClassSerializerInterceptor)
    async getPotentialOwners() {
        return (this.service as UserService).getPotentialOwners();
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('employeesByOwnerIdPaginated/:ownerId')
    getPaginatedEmployeesByOwnerId(
        @Param('ownerId') ownerId: string,
        @Query('page') page: number,
        @Query('itemQuantity') itemQuantity: number,
    ): Promise<PaginatedItems<User>> {
        return (this.service as UserService).getPaginatedEmployeesByOwnerId(ownerId, page, itemQuantity);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Get('employees')
    @UseInterceptors(ClassSerializerInterceptor)
    async getEmployees() {
        return this.service.findAllWhere({ role: Role.User, isDeleted: false }, ['workplaces']);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('employees/paginated')
    getItemsPaginatedWhere(@Query('page') page: number, @Query('itemQuantity') itemQuantity: number): Promise<PaginatedItems<User>> {
        return this.service.getItemsPaginatedWhere(page, itemQuantity, { role: Role.User, isDeleted: false }, ['workplaces']);
    }
}
