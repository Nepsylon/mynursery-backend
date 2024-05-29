import { Body, Delete, Get, HttpException, Param, Post, Put, Request } from '@nestjs/common';
import { MyNurseryBaseEntity } from '../entity/base.entity';
import { MyNurseryBaseService } from '../service/base.service';
import { DeleteResult, UpdateResult } from 'typeorm';

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
    @Post()
    create(@Body() dto: any, @Request() req: any): Promise<T | HttpException> {
        return this.service.create(dto, req.user);
    }

    /**
     * Méthode de recherche par défaut
     * @param req La requête dans laquelle on peut trouver le champ user
     * @returns Un tableau des entités ou une erreur
     */
    @Get()
    findAll(@Request() req: any): Promise<T[] | HttpException> {
        return this.service.findAll(req.user);
    }

    /**
     * Méthode de recherche individuelle
     * @param id L'identifiant de l'élément voulu
     * @param req La requête avec le champ user
     * @returns L'entité demandée ou une erreur
     */
    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any): Promise<T | HttpException> {
        return this.findOne(id, req.user);
    }

    /**
     * Méthode de modification individuelle
     * @param id L'identifiant de l'élément voulu
     * @param dto Les champs à modifier
     * @param req La requête avec le champ user
     * @returns Le résultat de la modification ou une erreur
     */
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: any, @Request() req: any): Promise<UpdateResult | HttpException> {
        return this.service.update(id, dto, req.user);
    }

    /**
     * Méthode de suppression individuelle
     * @param id L'identifiant de l'élément voulu
     * @param req La requête avec le champ user
     * @returns Le résultat de la suppression ou une erreur
     */
    @Delete(':id')
    delete(@Param('id') id: string, @Request() req: any): Promise<DeleteResult | HttpException> {
        return this.service.delete(id, req.user);
    }
}
