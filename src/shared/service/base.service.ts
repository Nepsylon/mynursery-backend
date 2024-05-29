import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseEntity } from '../entity/base.entity';
import { BaseService } from '../interfaces/base-service.interface';
import { DeleteResult, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { ErrorMessage } from '../models/error-message';
import { Token } from '../interfaces/token.interface';

@Injectable()
export abstract class MyNurseryBaseService<T extends MyNurseryBaseEntity> implements BaseService<T> {
    /**
     * Tableau d'erreurs avec la source et le message de l'erreur
     **/
    errors: ErrorMessage[] = [];

    constructor(private readonly repository: Repository<T>) {}

    /**
     * Vérification du droit d'écriture
     * @param dto L'objet en attente ne doit pas être vide
     * @param user Le jeton d'accès de l'utilisateur connecté
     * @returns Valeur booléenne
     */
    abstract canCreate(dto: T, user?: Token): boolean;

    /**
     * La fonction de création par défaut
     * @param dto L'objet en attente
     * @param user Le jeton d'accès optionnel de l'utilisateur connecté
     * @returns Le résultat de l'objet ajouté ou une erreur
     */
    async create(dto: T | T[] | any, user?: Token): Promise<T | HttpException> {
        try {
            if (this.canCreate(dto, user)) {
                return await this.repository.save(dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    // Fonction nécessitant un jeton d'accès optionnel selon la nature de la requête
    abstract hasStandardAccess(user?: Token): boolean;

    /**
     * Fonction pour chercher toutes les données d'une table SQL
     * @param user Le jeton d'accès optionnel
     * @returns L'entièreté de la table sous forme de tableau ou une erreur à afficher
     */
    async findAll(user?: Token): Promise<HttpException | T[]> {
        try {
            if (this.hasStandardAccess(user)) {
                return await this.repository.find({ order: { id: 'ASC' } as FindOptionsWhere<unknown> });
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    // Fonction nécessitant un jeton d'accès optionnel selon la nature de la requête
    abstract hasSpecificAccess(user?: Token): boolean;

    /**
     * Fonction pour chercher une donnée spécifique dans la table SQL
     * @param id L'identifiant de l'élément à trouver
     * @param user Le jeton d'accès optionnel
     * @returns L'entité demandée ou une erreur à afficher
     */
    async findOne(id: string | number, user?: Token): Promise<T | HttpException> {
        try {
            if (this.hasSpecificAccess(user)) {
                return await this.repository.findOne({ where: { id: id } as FindOptionsWhere<unknown> });
            } else {
                //                 throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);

                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    // Fonction qui vérifie si le user est connecté
    abstract canUpdate(user?: Token): boolean;

    /**
     * Fonction pour mettre à jour une entité dans la base de données
     * @param id L'identifiant de l'élément à modifier
     * @param dto L'objet avec les nouvelles données
     * @param user Le jeton d'accès aux ressources
     * @returns Un résultat générique de validation ou une erreur Http
     */
    async update(id: string, dto: any, user: Token): Promise<UpdateResult | HttpException> {
        try {
            if (this.canUpdate(user)) {
                return await this.repository.update(id, dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    // Fonction qui vérifie si le user est connecté
    abstract canDelete(user?: Token): boolean;

    /**
     * Fonction pour supprimer une entité dans la base de données
     * @param id L'identifiant de l'élément à supprimer
     * @param user Le jeton d'accès aux ressources
     * @returns Un résultat générique de validation ou une erreur Http
     */
    async delete(id: string, user: Token): Promise<DeleteResult | HttpException> {
        try {
            if (this.canDelete(user)) {
                return await this.repository.delete(id);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Méthodes utilitaires
     */

    /**
     * Méthode qui sera appelée lors des erreurs de logique métier afin de mieux déboguer
     * @param message Message reçue lors de l'erreur
     * @param source La source qu'on passe en paramètre
     * @returns /
     */
    generateError(message: string, source: string): void {
        if (!message || !source) return;
        const newError = new ErrorMessage(message, source);
        this.errors.push(newError);
    }
}
