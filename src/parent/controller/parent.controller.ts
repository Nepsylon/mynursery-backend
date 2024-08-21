import { Body, Controller, Delete, HttpException, Param, Post, UseGuards } from '@nestjs/common';
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

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Post(':parentId/children')
    async setChildrenToParent(@Param('parentId') parentId: number, @Body() childIds: number[]): Promise<Parent | HttpException> {
        return (this.service as ParentService).setChildrenToParent(parentId, childIds);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Delete(':parentId/children')
    async deleteChildrenToParent(@Param('parentId') parentId: number, @Body() childIds: number[]): Promise<Parent | HttpException> {
        return (this.service as ParentService).deleteChildrenForParent(parentId, childIds);
    }
}
