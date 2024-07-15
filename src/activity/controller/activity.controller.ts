import { Controller, Delete, Get, HttpException, Param, Put, UseGuards, Body, Post, Query } from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Activity } from '../entities/activity.entity';
import { ActivityService } from '../service/activity.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { createActivityDto } from '../interface/create-activity-dto';

@Controller('activity')
export class ActivityController extends MyNurseryBaseController<Activity> {
    constructor(service: ActivityService) {
        super(service);
    }

    @UseGuards(AuthGuard)
    @Put(':activityId/child/:NewchildId/assign')
    async setChildToActivity(
        @Param('activityId') activityId: number,
        @Param('NewchildId') NewchildId: number,
    ): Promise<Activity | HttpException> {
        return (this.service as ActivityService).setChildToActivity(activityId, NewchildId);
    }

    @UseGuards(AuthGuard)
    @Post('/children')
    async createActivityWithChildren(@Body() createActiviteDto: createActivityDto): Promise<Activity> {
        return (this.service as ActivityService).createActivityWithChildren(createActiviteDto);
    }
}
