import { ClassSerializerInterceptor, Controller, Delete, Get, HttpException, Param, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Nursery } from '../entities/nursery.entity';
import { NurseryService } from '../service/nursery.service';
import { User } from 'src/user/entities/user.entity';
import { Child } from 'src/child/entities/child.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

@Controller('nurseries')
export class NurseryController extends MyNurseryBaseController<Nursery> {
    constructor(service: NurseryService) {
        super(service);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('owner=:nurseryId')
    async getOwnerNursery(@Param('nurseryId') nurseryId: number): Promise<User | HttpException> {
        return (this.service as NurseryService).getOwnerNursery(nurseryId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':nurseryId/owner/:newOwnerId/assign')
    async setOwner(@Param('nurseryId') nurseryId: number, @Param('newOwnerId') newOwnerId: number): Promise<Nursery | HttpException> {
        return (this.service as NurseryService).setOwnerNursery(nurseryId, newOwnerId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Get('childrenByNursery=:nurseryId')
    async getChildrenByNursery(@Param('nurseryId') nurseryId: number): Promise<Child[] | HttpException> {
        return (this.service as NurseryService).getChildrenByNursery(nurseryId);
    }
}
