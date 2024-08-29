import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { MyNurseryBaseEntity } from '../entities/base.entity';
import { BaseService } from '../interfaces/base-service.interface';
import { DeleteResult, FindOptionsWhere, ILike, In, Repository, UpdateResult } from 'typeorm';
import { ErrorMessage } from '../models/error-message';
import { PaginatedItems } from '../interfaces/paginatedItems.interface';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

@Injectable()
export abstract class MyNurseryBaseService<T extends MyNurseryBaseEntity> implements BaseService<T> {
    /**
     * Tableau d'erreurs avec la source et le message de l'erreur
     **/
    errors: ErrorMessage[] = [];

    constructor(private readonly repository: Repository<T>) {}

    /**
     * Vérification des champs obligatoires
     * @param dto L'objet en attente ne doit pas être vide
     * @returns Valeur booléenne
     */
    abstract eligibleCreateFormat(dto: T): Promise<boolean>;

    /**
     * La fonction de création par défaut
     * @param dto L'objet en attente
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
     * Fonction pour chercher toutes les données d'une table SQL avec comme condition : IsDeleted à true
     * @returns L'entièreté de la table sous forme de tableau ou une erreur à afficher
     */

    async findAll(): Promise<T[] | HttpException> {
        try {
            return await this.repository.find({
                where: { isDeleted: false } as FindOptionsWhere<T>,
                order: { id: 'ASC' } as FindOptionsWhere<unknown>,
            });
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Fonction pour chercher toutes les données d'une table SQL avec des conditions dynamiques
     * @returns Un tableau d'éléments sur base de la/les condition(s) ou une erreur à afficher
     */

    async findAllWhere(criteria: Record<string, any>, relations?: string[]): Promise<T[] | HttpException> {
        const whereCondition: FindOptionsWhere<T> = criteria as FindOptionsWhere<T>;

        try {
            return await this.repository.find({
                where: whereCondition,
                relations: relations,
                order: { id: 'ASC' } as FindOptionsWhere<unknown>,
            });
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Fonction pour chercher toutes les données d'une table SQL avec comme conidtion IsDeleted à true
     * @returns L'entièreté de la table sous forme de tableau ou une erreur à afficher
     */

    async findAllArchives(): Promise<T[] | HttpException> {
        try {
            const result = await this.repository.find({
                where: { isDeleted: true } as FindOptionsWhere<unknown>,
                order: { id: 'ASC' } as FindOptionsWhere<unknown>,
            });
            return result;
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Fonction pour chercher une donnée spécifique dans la table SQL
     * @param id L'identifiant de l'élément à trouver
     * @param isDeleted C'est le booléen du "soft delete"
     * @returns L'entité demandée ou une erreur à afficher
     */
    async findOne(id: string | number): Promise<T | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repository.findOne({
                where: { id: id, isDeleted: false } as FindOptionsWhere<unknown>,
            });
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
     * @condition isDeleted C'est le booléen du "soft delete"
     * @returns Un résultat générique de validation ou une erreur Http
     */
    async update(id: string, dto: any): Promise<UpdateResult | HttpException> {
        this.errors = [];
        try {
            const foundOne = await this.repository.findOne({
                where: { id: id, isDeleted: false } as FindOptionsWhere<unknown>,
            });
            if (foundOne) {
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
     * Méthode de soft delete individuel
     * @param id L'identifiant de l'élément voulu
     * @returns cela true si cela a été supprimé
     */
    async softDelete(id: string): Promise<boolean | HttpException> {
        this.errors = [];
        try {
            const record = await this.repository.findOne({
                where: { id: id, isDeleted: false } as FindOptionsWhere<unknown>,
            });
            if (record) {
                record.isDeleted = true;
                //record.deletedAt = new Date();
                await this.repository.save(record);
                return true;
            } else {
                this.generateError(`Il n'existe pas d'élément avec cet identifiant.`, 'id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Méthode de soft delete multiple
     * @param id L'identifiant de l'élément voulu
     * @returns cela true si cela a été supprimé
     */
    async softDeleteMultiple(ids: number[]): Promise<boolean | HttpException> {
        this.errors = [];
        try {
            if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'number' || isNaN(id))) {
                this.generateError(`Les ids ne sont pas valides.`, 'ids');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            const records = await this.repository.find({
                where: { id: In(ids), isDeleted: false } as FindOptionsWhere<T>,
            });

            if (records.length > 0) {
                records.forEach((record) => (record.isDeleted = true));
                await this.repository.save(records);
                return true;
            } else {
                this.generateError(`Il n'existe pas d'élément avec ces identifiants.`, 'ids');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    async deleteMultiple(ids: number[]): Promise<DeleteResult | HttpException> {
        try {
            const result = await this.repository.delete(ids);

            if (result.affected === 0) {
                throw new NotFoundException('No items found for the given IDs.');
            }

            return result;
        } catch (err) {
            this.generateError(`Il n'existe pas d'élément avec ces identifiants.`, 'ids');
            throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Méthode de restore individuel
     * @param id L'identifiant de l'élément voulu
     * @returns L'élément restauré
     */
    async restore(id: number): Promise<T | HttpException> {
        this.errors = [];
        try {
            const record = await this.repository.findOne({
                where: { id: id, isDeleted: true } as FindOptionsWhere<unknown>,
            });
            if (record) {
                record.isDeleted = false;
                //record.deletedAt = new Date();
                return this.repository.save(record);
            } else {
                this.generateError(`Il n'existe pas d'élément supprimé avec cet identifiant.`, 'restore id');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }
        } catch (err) {
            throw err;
        }
    }

    /**
     * Méthode de restore multiple
     * @param id La liste des identifiants à restaurer
     * @returns Une liste des éléments
     */
    async restoreMultiple(ids: number[]): Promise<T[] | HttpException> {
        this.errors = [];
        try {
            if (!Array.isArray(ids) || ids.some((id) => typeof id !== 'number' || isNaN(id))) {
                this.generateError(`Les ids ne sont pas valides.`, 'ids');
                throw new HttpException({ errors: this.errors }, HttpStatus.BAD_REQUEST);
            }

            const records = await this.repository.find({
                where: { id: In(ids), isDeleted: true } as FindOptionsWhere<T>,
            });

            if (records.length > 0) {
                records.forEach((record) => (record.isDeleted = false));
                return this.repository.save(records);
            } else {
                this.generateError(`Il n'existe pas d'éléments supprimés avec ces identifiants.`, 'restore ids');
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

    /**
     * Méthode de vérification de champs
     * @param field Champ à vérifier
     * @param value Valeur qui ne doit pas être un doublon
     * @returns true si unique sinon false
     */
    async verifyUnicity(field: string, value: string): Promise<boolean> {
        const whereCondition: FindOptionsWhere<T> = { [field]: value } as FindOptionsWhere<T>;
        const resultBasedOnField = await this.repository.findOne({ where: whereCondition });

        return !resultBasedOnField ? true : false;
    }

    async getItemsPaginated(pageNumber: number, itemQuantity: number): Promise<PaginatedItems<T>> {
        try {
            const offset = pageNumber * itemQuantity;
            const [items, totalCount] = await this.repository.findAndCount({
                skip: offset,
                take: itemQuantity,
                where: { isDeleted: false } as FindOptionsWhere<T>,
            });

            const totalPages = Math.ceil(totalCount / itemQuantity);

            const foundItems: PaginatedItems<T> = {
                items: items,
                totalPages: totalPages,
                totalCount: totalCount,
            };
            return foundItems;
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    async getItemsPaginatedWhere(
        pageNumber: number,
        itemQuantity: number,
        criteria: Record<string, any>,
        relations?: string[],
    ): Promise<PaginatedItems<T>> {
        try {
            const whereCondition: FindOptionsWhere<T> = criteria as FindOptionsWhere<T>;
            const offset = pageNumber * itemQuantity;
            const [items, totalCount] = await this.repository.findAndCount({
                skip: offset,
                take: itemQuantity,
                where: whereCondition,
                relations: relations,
            });

            const totalPages = Math.ceil(totalCount / itemQuantity);

            const foundItems: PaginatedItems<T> = {
                items: items,
                totalPages: totalPages,
                totalCount: totalCount,
            };
            return foundItems;
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     * Méthode pour rechercher des entités
     * @param field Champ dans lequel nous allons chercher
     * @param value Valeur correspondante
     * @returns Une liste de type T avec les réponses possibles
     */
    async searchElements(field: string, value: string): Promise<T[]> {
        try {
            return await this.repository.find({
                where: { [field as string]: ILike(`%${value}%`), isDeleted: false } as FindOptionsWhere<unknown>,
            });
        } catch (err) {
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }

    /**
     *
     * @param image Champs image d'un formulaire
     * @param folder le dossier de stockage dans firebase
     * @returns l'url sous forme de chaîne de caractères
     */
    async uploadFile(image: Express.Multer.File, folder: string): Promise<string> {
        const storage = getStorage();
        // Génère une chaîne de caractères représentant la date actuelle
        const currentDate = new Date().toISOString().replace(/:/g, '-');
        const storageRef = ref(storage, `${folder}/${currentDate}-${image.originalname}`);

        const snapshot = await uploadBytes(storageRef, image.buffer);

        const path = await getDownloadURL(snapshot.ref);

        return path; // Renvoie l'url de l'image sous forme de chaîne de caractères
    }

    async deleteFile(fileUrl: string): Promise<void | HttpException> {
        try {
            const storage = getStorage();

            // Extraire le chemin du fichier à partir de l'URL
            const decodedUrl = decodeURIComponent(fileUrl);
            const baseUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.app.options.storageBucket}/o/`;
            const filePath = decodedUrl.replace(baseUrl, '').split('?')[0];

            const fileRef = ref(storage, filePath);

            // Supprimer le fichier
            await deleteObject(fileRef);
        } catch (err) {
            this.generateError('Une erreur est survenue pendant la suppression', 'file delete');
            throw new HttpException({ errors: err }, HttpStatus.BAD_REQUEST);
        }
    }
}
