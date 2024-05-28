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
     * Est-ce que la requête possède les droits de création ?
     * @param dto l'objet en attente
     * @param user [optionnel] le jeton d'accès de l'utilisateur connecté
     */
    abstract canCreate(dto: T, user?: Token): boolean;

    /**
     * La méthode de création par défaut
     * @param dto l'objet en attente
     * @param user [optionnel] le jeton d'accès de l'utilisateur connecté
     * @returns le résultat de l'objet ajouté ou une erreur
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

    abstract hasStandardAccess(user?: Token): boolean;

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

    abstract hasSpecificAccess(user?: Token): boolean;

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

    abstract canUpdate(user?: Token): boolean;

    async update(id: string, dto: any, user?: Token): Promise<UpdateResult | HttpException> {
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

    abstract canDelete(user?: Token): boolean;

    async delete(id: string, user?: Token): Promise<DeleteResult | HttpException> {
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
}
