import {
    Body,
    ClassSerializerInterceptor,
    Delete,
    Get,
    HttpException,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { MyNurseryBaseEntity } from '../entities/base.entity';
import { MyNurseryBaseService } from '../service/base.service';
import { DeleteResult, UpdateResult } from 'typeorm';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { PaginatedItems } from '../interfaces/paginatedItems.interface';
import { FileInterceptor } from '@nestjs/platform-express';

export class MyNurseryBaseController<T extends MyNurseryBaseEntity> {
    constructor(public service: MyNurseryBaseService<T>) {}
    /**
     * Toutes les méthodes ci-dessous seront utilisées partout ailleurs sauf si override par le controller enfant
     */

    /**
     * Méthode de création par défaut
     * @param dto Objet à recevoir
     * @param req La requête dans laquelle on peut trouver le champ user
     * @returns Le résultat de l'entité ou une erreur
     */
    @UseGuards(AuthGuard)
    @Post()
    create(@Body() dto: any): Promise<T | HttpException> {
        return this.service.create(dto);
    }

    /**
     * Méthode de recherche par défaut
     * @param req La requête dans laquelle on peut trouver le champ user
     * @returns Un tableau des entités ou une erreur
     */
    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get()
    findAll(): Promise<T[] | HttpException> {
        return this.service.findAll();
    }

    //A SUPPRIMER APRES
    @Get('test')
    test(): string {
        return this.service.test();
    }

    /**
     * Méthode pour accéder aux éléments archivés
     * @returns Un tableau des entités ou une erreur
     */
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(Role.Admin, Role.Owner)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('archives')
    findAllArchives(): Promise<T[] | HttpException> {
        return this.service.findAllArchives();
    }

    /**
     * Méthode pour rechercher des entités
     * @param field Champ dans lequel nous allons chercher
     * @param value Valeur correspondante
     * @returns Une liste de type T avec les réponses possibles
     */
    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get('search')
    searchElements(@Query('field') field: string, @Query('value') value: string): Promise<T[]> {
        return this.service.searchElements(field, value);
    }

    /**
     * Méthode pour obtenir des éléments indexés
     * @param page Numéro de page désirée
     * @param itemQuantity Nombre d'élément à renvoyer par page
     * @returns Liste d'éléments T avec le nombre total d'entités T dans la db et le nombre total de pages
     */
    @UseGuards(AuthGuard)
    @Get('paginated')
    getPaginatedItems(@Query('page') page: number, @Query('itemQuantity') itemQuantity: number): Promise<PaginatedItems<T>> {
        return this.service.getItemsPaginated(page, itemQuantity);
    }

    /**
     * Méthode de soft delete multiple
     * @returns cela true si cela a été supprimé
     */
    @UseGuards(AuthGuard)
    @Post('multiple')
    softDeleteMultiple(@Body() ids: number[]): Promise<boolean | HttpException> {
        return this.service.softDeleteMultiple(ids);
    }

    /**
     * Méthode de recherche individuelle
     * @param id L'identifiant de l'élément voulu
     * @param req La requête avec le champ user
     * @returns L'entité demandée ou une erreur
     */
    @UseGuards(AuthGuard)
    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':id')
    findOne(@Param('id') id: string): Promise<T | HttpException> {
        return this.service.findOne(id);
    }

    /**
     * Méthode de modification individuelle
     * @param id L'identifiant de l'élément voulu
     * @param dto Les champs à modifier
     * @param req La requête avec le champ user
     * @returns Le résultat de la modification ou une erreur
     */
    @UseGuards(AuthGuard)
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any): Promise<UpdateResult | HttpException> {
        return this.service.update(id, dto);
    }

    /**
     * Méthode de soft delete individuelle
     * @param id L'identifiant de l'élément voulu
     * @returns Le résultat de la suppression ou une erreur
     */
    @UseGuards(AuthGuard)
    @Delete(':id')
    softDelete(@Param('id') id: string): Promise<boolean | HttpException> {
        return this.service.softDelete(id);
    }

    /**
     * Méthode de suppression individuel
     * @param id L'identifiant de l'élément voulu
     * @returns Le résultat de la suppression ou une erreur
     */
    @UseGuards(AuthGuard)
    @Delete(':id/definitive')
    delete(@Param('id') id: string): Promise<DeleteResult | HttpException> {
        return this.service.delete(id);
    }

    @UseGuards(AuthGuard)
    @Post('uploadFile')
    @UseInterceptors(FileInterceptor('image')) // 'image' correspond au nom du champ dans le formulaire
    async uploadFile(@UploadedFile() image: Express.Multer.File, @Query('folder') folder: string): Promise<string> {
        return await this.service.uploadFile(image, folder);
    }
}
