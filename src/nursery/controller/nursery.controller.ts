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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { MyNurseryBaseController } from 'src/shared/controller/base.controller';
import { Nursery } from '../entities/nursery.entity';
import { NurseryService } from '../service/nursery.service';
import { User } from 'src/user/entities/user.entity';
import { Child } from 'src/child/entities/child.entity';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { Role } from 'src/shared/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { createNurseryDto } from '../interface/create-nursery-dto';
import { UpdateResult } from 'typeorm';

@Controller('nurseries')
export class NurseryController extends MyNurseryBaseController<Nursery> {
    constructor(service: NurseryService) {
        super(service);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(FileInterceptor('logo'))
    @Post()
    async create(@Body() form: createNurseryDto, @UploadedFile() logo?: Express.Multer.File): Promise<Nursery | HttpException> {
        return (this.service as NurseryService).create(form, logo);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('childrenByNursery=:nurseryId')
    async getChildrenByNursery(@Param('nurseryId') nurseryId: number): Promise<Child[] | HttpException> {
        return (this.service as NurseryService).getChildrenByNursery(nurseryId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('owner=:nurseryId')
    async getOwnerNursery(@Param('nurseryId') nurseryId: number): Promise<User | HttpException> {
        return (this.service as NurseryService).getOwnerNursery(nurseryId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @UseInterceptors(ClassSerializerInterceptor)
    @Put(':nurseryId/owner/:newOwnerId/assign')
    async setOwner(@Param('nurseryId') nurseryId: number, @Param('newOwnerId') newOwnerId: number): Promise<Nursery | HttpException> {
        return (this.service as NurseryService).setOwnerNursery(nurseryId, newOwnerId);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any): Promise<UpdateResult | HttpException> {
        return this.service.update(id, dto);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(FileInterceptor('logo'))
    @Post(':id/logo')
    updateLogo(@Param('id') nurseryId: string, @UploadedFile() logo: Express.Multer.File): Promise<UpdateResult | HttpException> {
        return (this.service as NurseryService).updateLogo(nurseryId, logo);
    }

    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @Delete(':id/logo')
    deleteLogo(@Param('id') nurseryId: string): Promise<Nursery | HttpException> {
        return (this.service as NurseryService).deleteLogo(nurseryId);
    }
}
