import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Child } from '../entities/child.entity';
import { ChildService } from '../service/child.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { PaginatedItems } from 'src/shared/interfaces/paginatedItems.interface';

@Controller('children')
export class ChildController extends MyNurseryBaseController<Child> {
    constructor(service: ChildService) {
        super(service);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Put(':childId/nursery/:nurseryId/assign')
    async setNurseryToChild(@Param('childId') childId: number, @Param('nurseryId') nurseryId: number): Promise<Child | HttpException> {
        return (this.service as ChildService).setNurseryToChild(childId, nurseryId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('childrenByOwnerIdPaginated/:ownerId')
    getPaginatedChildrenByOwnerId(
        @Param('ownerId') ownerId: string,
        @Query('page') page: number,
        @Query('itemQuantity') itemQuantity: number,
    ): Promise<PaginatedItems<Child>> {
        return (this.service as ChildService).getPaginatedChildrenByOwnerId(ownerId, page, itemQuantity);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Post(':childId/parents')
    async setParentsToChild(@Param('childId') childId: number, @Body() parentIds: number[]): Promise<Child | HttpException> {
        return (this.service as ChildService).setParentsToChild(childId, parentIds);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Delete(':childId/parents')
    async deleteParentsToChild(@Param('childId') childId: number, @Body() parentIds: number[]): Promise<Child | HttpException> {
        return (this.service as ChildService).deleteParentsToChild(childId, parentIds);
    }
}
