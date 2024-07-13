import { ClassSerializerInterceptor, Controller, Delete, Get, HttpException, Param, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Child } from '../entities/child.entity';
import { ChildService } from '../service/child.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { Nursery } from 'src/nursery/entities/nursery.entity';

@Controller('children')
export class ChildController extends MyNurseryBaseController<Child> {
    constructor(service: ChildService) {
        super(service);
    }

    @UseGuards(AuthGuard)
    @Put(':childId/nursery/:nurseryId/assign')
    async setNurseryToChild(@Param('childId') childId: number, @Param('nurseryId') nurseryId: number): Promise<Child | HttpException> {
        return (this.service as ChildService).setNurseryToChild(childId, nurseryId);
    }
}
