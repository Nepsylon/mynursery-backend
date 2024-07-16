import { ClassSerializerInterceptor, Controller, Delete, Get, HttpException, Param, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Parent } from '../entities/parent.entity';
import { ParentService } from '../service/parent.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';

@Controller('parents')
export class ParentController extends MyNurseryBaseController<Parent> {
    constructor(service: ParentService) {
        super(service);
    }

    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':parentId/child/:NewchildId/assign')
    async setChildToParent(@Param('parentId') parentId: number, @Param('NewchildId') NewchildId: number): Promise<Parent | HttpException> {
        return (this.service as ParentService).setChildToParent(parentId, NewchildId);
    }
}
