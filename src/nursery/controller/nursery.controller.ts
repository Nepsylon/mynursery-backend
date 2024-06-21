import { ClassSerializerInterceptor, Controller, Get, HttpException, Param, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Nursery } from '../entities/nursery.entity';
import { NurseryService } from '../service/nursery.service';
import { User } from 'src/user/entities/user.entity';
import { UserNursery } from '../entities/user-nursery.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('nurseries')
export class NurseryController extends MyNurseryBaseController<Nursery> {
    constructor(service: NurseryService) {
        super(service);
    }

    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('owner=:nurseryId')
    async getUserNursery(@Param('nurseryId') nurseryId: number): Promise<User> {
        return (this.service as NurseryService).getOwnerNursery(nurseryId);
    }

    @Put(':nurseryId/owner/:ownerId/assign')
    async setOwner(@Param('nurseryId') nurseryId: number, @Param('ownerId') ownerId: number): Promise<UserNursery | HttpException> {
        return (this.service as NurseryService).setOwnerNursery(nurseryId, ownerId);
    }
}
