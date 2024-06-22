import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { MyNurseryBaseEntity } from '../entities/base.entity';
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

    // A SUPPRIMER APRES
    test(): string {
        return 'Le controller marche bien';
    }

    /**
     * Vérification des champs obligatoires
     * @param dto L'objet en attente ne doit pas être vide
     * @returns Valeur booléenne
     */
    abstract eligibleCreateFormat(dto: T): Promise<boolean>;

    /**
     * La fonction de création par défaut
     * @param dto L'objet en attente
     * @param user Le jeton d'accès optionnel de l'utilisateur connecté
     * @returns Le résultat de l'objet ajouté ou une erreur
     */
    async create(dto: T | T[] | any): Promise<T | HttpException> {
        this.errors = [];
        try {
            if (await this.eligibleCreateFormat(dto)) {
                return await this.repository.save(dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Fonction pour chercher toutes les données d'une table SQL
     * @param user Le jeton d'accès optionnel
     * @returns L'entièreté de la table sous forme de tableau ou une erreur à afficher
     */
    async findAll(): Promise<T[] | HttpException> {
        try {
            return await this.repository.find({ order: { id: 'ASC' } as FindOptionsWhere<unknown> });
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Fonction pour chercher une donnée spécifique dans la table SQL
     * @param id L'identifiant de l'élément à trouver
     * @param user Le jeton d'accès optionnel
     * @returns L'entité demandée ou une erreur à afficher
     */
    async findOne(id: string | number): Promise<T | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repository.findOne({ where: { id: id } as FindOptionsWhere<unknown> });
            if (foundOne) {
                return foundOne;
            } else {
                this.generateError(`Il n'existe pas d'élément avec cet identifiant.`, 'id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Fonction pour mettre à jour une entité dans la base de données
     * @param id L'identifiant de l'élément à modifier
     * @param dto L'objet avec les nouvelles données
     * @param user Le jeton d'accès aux ressources
     * @returns Un résultat générique de validation ou une erreur Http
     */
    async update(id: string, dto: any): Promise<UpdateResult | HttpException> {
        this.errors = [];
        try {
            if (id) {
                return await this.repository.update(id, dto);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Fonction pour supprimer une entité dans la base de données
     * @param id L'identifiant de l'élément à supprimer
     * @param user Le jeton d'accès aux ressources
     * @returns Un résultat générique de validation ou une erreur Http
     */
    async delete(id: string): Promise<DeleteResult | HttpException> {
        this.errors = [];
        try {
            if (id) {
                return await this.repository.delete(id);
            } else {
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Méthode pour enregistrer une entrée dans la table SQL
     * @param dto L'objet à sauvegarder
     * @returns L'objet sauvegardé ou une erreur HTTP
     */
    async save(dto: T): Promise<T | HttpException> {
        this.errors = [];
        try {
            if (dto) {
                return await this.repository.save(dto);
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

    hasErrors(): boolean {
        return !(this.errors.length != 0);
    }

    async verifyUnicity(field: string, value: string): Promise<boolean> {
        const whereCondition: FindOptionsWhere<T> = { [field]: value } as FindOptionsWhere<T>;
        const resultBasedOnField = await this.repository.findOne({ where: whereCondition });

        return !resultBasedOnField ? true : false;
    }
}
